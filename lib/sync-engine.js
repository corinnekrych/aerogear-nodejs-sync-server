'use strict';
const util = require('util');
const debuglog = util.debuglog('sync-engine');
var utils = require('./utils');

var SEEDED_CLIENT_VERSION = -1;
var SEEDED_SERVER_VERSION = 1;

/**
 * The SyncEngine is responsible for driving the main differential
 * synchronization algorithm.
 *
 * During construction the engine gets injected with an instance of
 * {@link ServerSynchronizer} which takes care of diff/patching operations, and
 * an instance of {@link ServerDataStore} for storing data.
 *
 * A synchronizer in AeroGear is a module that serves two purposes which are
 * closely related:
 * 1. To provide storage for the data type
 * 2. To provide the patching algorithm to be used on that data type
 *
 * The name synchronizer is because they take care of the synchronization part
 * of the Differential Synchronization algorithm. For example, one synchronizer
 * might support plain text while another supports JSON Objects as the content
 * of documents being stored. But a patching algorithm used for plain text
 * might not be appropriate for JSON Objects.
 *
 * @constructor
 * @param synchronizer - The synchronizer to use.
 * @param datastore - The datastore to use.
 */
var SyncEngine = function (synchronizer, datastore) {
  if (!(this instanceof SyncEngine)) {
    return new SyncEngine();
  }

  this.synchronizer = synchronizer;
  this.datastore = datastore;

  this.saveDocument = function (doc) {
    return datastore.saveDocument(doc);
  };

  this.saveShadow = function (doc) {
    debuglog('Save shadow:', doc, 'for client', doc.clientId);
    return datastore.saveShadow(doc);
  };

  this.saveBackup = function (shadow, clientId, version) {
    debuglog('Save backup:', shadow, 'for client', clientId, 'version', version);
    return datastore.saveBackup(shadow, clientId, version);
  };

  this.getDocument = function (docId) {
    return datastore.getDocument(docId);
  };

  this.serverDiff = function (doc, shadow) {
    var patchMsg, pendingEdits;

    if (typeof doc.content !== 'string') {
      doc.content = JSON.stringify(doc.content);
      shadow.content = JSON.stringify(shadow.content);
    }

    patchMsg = {
      msgType: 'patch',
      id: doc.id,
      clientId: shadow.clientId,
      edits: [synchronizer.serverDiff(doc, shadow)]
    };

    // add any pending edits from the store
    pendingEdits = datastore.getEdits(doc.id);
    if (pendingEdits && pendingEdits.length > 0) {
      patchMsg.edits = pendingEdits.concat(patchMsg.edits);
    }

    return patchMsg;
  };

  this._seededShadowFrom = function (shadow, doc) {
    var d = doc.content === undefined ? datastore.getDocument(doc.id) : doc;
    return {
      id: d.id,
      clientId: shadow.clientId,
      serverVersion: SEEDED_SERVER_VERSION,
      clientVersion: SEEDED_CLIENT_VERSION,
      content: d.content
    };
  };

  this.getShadow = function (id) {
    return datastore.getShadow(id);
  };

  this.getBackup = function (id) {
    return datastore.getBackup(id);
  };

  return this;
};

SyncEngine.prototype.addDocument = function (document, clientId) {
  var saved, existingDoc, shadowDocument, patchMessage, shadowCopy, seeded;

  if (!document.content) {
    existingDoc = this.getDocument(document.id);
    if (!existingDoc) {
      patchMessage = {
        msgType: 'patch',
        id: document.id,
        clientId: clientId,
        edits: []
      };
    } else {
      shadowDocument = this.addShadowForClient(document.id, clientId);
      seeded = this._seededShadowFrom(shadowDocument, document);
      patchMessage = this.serverDiff(shadowDocument, seeded);
      shadowDocument = this.synchronizer.patchShadow(patchMessage.edits[0], shadowDocument);
      this.datastore.saveShadow(shadowDocument);
    }
    return patchMessage;
  }

  // Save document, and check if it was saved successfully
  saved = this.saveDocument(document);
  debuglog('addedDocument: ', document);
  // Add Shadow for the client
  shadowDocument = this.addShadowForClient(document.id, clientId);

  if (saved) {
    shadowCopy = utils.poorMansCopy(shadowDocument);
    shadowCopy.serverVersion++;
    patchMessage = this.serverDiff(shadowDocument, shadowCopy);
  } else {
    debuglog('Document with ID: ' + document.id + ' exists already');
    seeded = this._seededShadowFrom(shadowDocument, document);
    patchMessage = this.serverDiff(shadowDocument, seeded);
  }

  return patchMessage;
};

SyncEngine.prototype.addShadowForClient = function (docId, clientId) {
  return this.addShadow(docId, clientId);
};

SyncEngine.prototype.addShadow = function (docId, clientId) {
  var currentDocument, shadowDocument;
  currentDocument = this.getDocument(docId);
  currentDocument.clientId = clientId;
  // Save Shadow
  shadowDocument = this.saveShadow(currentDocument);
  this.saveBackup(currentDocument, shadowDocument.serverVersion);
  debuglog('addedShadow: ', shadowDocument);
  return shadowDocument;
};

/**
 * Performs the server side diff which is performed when the server document is modified.
 * The produced Edit can be sent to the client for patching the client side document.
 *
 * @param docId the document id
 * @param clientId the client id
 */
SyncEngine.prototype.diff = function (docId, clientId) {
  var doc = this.getDocument(docId);
  var shadow = this.getShadow(docId);
  return this.synchronizer.serverDiff(doc, shadow);
};

SyncEngine.prototype.patch = function (patchMessage) {
  debuglog('SyncEngine.patch patchMessage: ', patchMessage);
  const docId = patchMessage.id;
  const clientId = patchMessage.clientId;
  var shadow = this.getShadow(docId);
  debuglog('Shadow: ', shadow);
  const that = this;

  const edits = patchMessage.edits;
  edits.forEach(function (edit) {
    if (edit.serverVersion < shadow.serverVersion) {
      shadow = that.restoreBackup(shadow, edit);
      return;
    }
    if (edit.clientVersion < shadow.clientVersion) {
      // already have this update so remove it
      that.datastore.removeEdit(edit, docId, clientId);
      return;
    }
    if ((edit.serverVersion === shadow.serverVersion &&
        edit.clientVersion === shadow.clientVersion) ||
        edit.clientVersion === -1) {
      shadow = that.synchronizer.patchShadow(edit, shadow);
      shadow.clientVersion += 1;
      that.datastore.removeEdit(edit);
      that.saveShadow(shadow, clientId);
    }
  });

  var doc = this.getDocument(docId);
  const edit = this.synchronizer.clientDiff(doc, shadow);
  const patchedDoc = this.synchronizer.patchDocument(edit, shadow);
  debuglog('Patched: ', patchedDoc);
  this.datastore.updateDocument(patchedDoc);
  this.datastore.saveBackup(shadow, shadow.serverVersion);
};

SyncEngine.prototype.restoreBackup = function (shadow, edit) {
  const that = this;
  var backup = that.datastore.getBackup(shadow.id);
  if (backup.version === edit.serverVersion) {
    var shadow = that.synchronizer.patchShadow(edit, backup); // TODO synchronizer.patchShadow should return serverVersion and clientVersion
    shadow.content.clientVersion += 1;
    that.datastore.removeEdit(edit);
    that.saveShadow(shadow, shadow.clientId);
  } else {
    // Illegal state
    debuglog("Restore backup:", backup);
    throw new Error('Illegal state: restore backup');
  }
};

module.exports = SyncEngine;

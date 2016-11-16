'use strict';
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
    return datastore.saveShadow(doc);
  };

  this.saveShadowBackup = function (shadow, version) {
    return datastore.saveShadowBackup(shadow, version);
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
      clientId: doc.clientId,
      edits: [synchronizer.serverDiff(doc, shadow)]
    };

    // add any pending edits from the store
    pendingEdits = datastore.getEdits(doc.id);
    if (pendingEdits && pendingEdits.length > 0) {
      patchMsg.edits = pendingEdits.concat(patchMsg.edits);
    }

    return patchMsg;
  };

  this._seededShadowFrom = function (shadowDocument, doc) {
    var d = doc.content === null ? datastore.getDocument(doc.id) : doc;
    return {
      id: d.id,
      clientId: shadowDocument.clientId,
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

SyncEngine.prototype.addSubscriber = function (subscriber, document) {
  console.log('TODO: ADD SUBSCRIBER STUFF');
  return this.addDocument(document, subscriber.clientId);
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

      // TODO : updateDocument(patchDocument(shadow));
    }

    return patchMessage;
  }

  // Save document, and check if it was saved successfully
  saved = this.saveDocument(document);
  // Add Shadow for the client
  shadowDocument = this.addShadowForClient(document.id, clientId);

  if (saved) {
    shadowCopy = utils.poorMansCopy(shadowDocument);
    shadowCopy.serverVersion++;
    patchMessage = this.serverDiff(shadowDocument, shadowCopy);
  } else {
    console.log('Document with ID: ' + document.id + ' exists already');
    seeded = this._seededShadowFrom(shadowDocument, document);
    patchMessage = this.serverDiff(shadowDocument, seeded);
  }

  return patchMessage;
};

SyncEngine.prototype.addShadowForClient = function (docId, clientId) {
  return this.addShadow(docId, clientId, 0);
};

SyncEngine.prototype.addShadow = function (docId, clientId, clientVersion) {
  var currentDocument, shadowDocument;
  currentDocument = this.getDocument(docId, 'docs');
  currentDocument.clientId = clientId;
  // Save Shadow
  shadowDocument = this.saveShadow(currentDocument);
  this.saveShadowBackup(currentDocument, 0);
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
  var doc = this.getDocument(docId, 'docs');
  var shadow = this.getShadow(docId);
  return this.synchronizer.serverDiff(doc, shadow);
};

SyncEngine.prototype.patch = function (patchMessage) {
  console.log('SyncEngine.patch patchMessage: ', patchMessage);
  const docId = patchMessage.id;
  const clientId = patchMessage.clientId;
  var shadow = this.getShadow(docId);
  const that = this;

  const edits = patchMessage.edits;
  edits.forEach(function (edit) {
    if (edit.serverVersion < shadow.serverVersion) {
      shadow = restoreBackup(shadow, edit);
      return;
    }
    if (edit.clientVersion < shadow.clientVersion) {
      // already have this update so remove it
      this.dataStore.removeEdit(edit, docId, clientId);
      return;
    }
    if (edit.serverVersion === shadow.serverVersion &&
        edit.clientVersion === shadow.clientVersion) {
      shadow = that.synchronizer.patchShadow(edit, shadow);
      shadow.clientVersion += 1;
      that.datastore.removeEdit(edit);
      that.saveShadow(shadow);
    }
  });

  var doc = this.getDocument(docId, 'docs');
  const edit = this.synchronizer.clientDiff(doc, shadow);
  const patchedDoc = this.synchronizer.patchDocument(edit, shadow);
  console.log('Patched: ', patchedDoc);
  this.datastore.updateDocument(patchedDoc);
  this.datastore.saveShadowBackup(shadow, shadow.serverVersion);
};

function restoreBackup (shadow, edit) {
  // TODO implement this.
}

module.exports = SyncEngine;

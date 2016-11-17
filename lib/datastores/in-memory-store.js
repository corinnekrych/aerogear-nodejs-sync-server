const utils = require('../utils');

/**
 * A server side {@link DataStore} implementation is responsible for storing
 * and serving data for a Differential Synchronization implementation.
 *
 * @constructor
 */
var InMemoryDataStore = function () {
  var docs = {};
  var edits = {};
  var shadows = {};
  var backups = {};

  if (!(this instanceof InMemoryDataStore)) {
    return new InMemoryDataStore();
  }

  /**
   * Retrieves the {@link Document} matching the passed-in document documentId.
   *
   * @param documentId the document identifier of the shadow document.
   * @returns {Object} - the document
   */
  this.getDocument = function (docId) {
    return docs[docId];
  };

  /**
   * Saves a server document.
   *
   * @param doc - the document to store
   * @returns {Boolean} - true if the document was stored
   */
  this.saveDocument = function (doc) {
    if (!docs[doc.id]) {
      docs[doc.id] = utils.poorMansCopy(doc);
      return true;
    }
    return false;
  };

  /**
   * Updates an existing document in the store
   *
   * @param doc - the document to update
   */
  this.updateDocument = function (doc) {
    var existingDoc = this.getDocument(doc.id);
    if (existingDoc) {
      docs[doc.id] = utils.poorMansCopy(doc);
    }
  };

  this.saveShadow = function (doc) {
    var shadow = {
      id: doc.id,
      serverVersion: doc.serverVersion || 0,
      clientId: doc.clientId,
      clientVersion: doc.clientVersion || 0,
      content: doc.content
    };
    shadows[doc.id] = utils.poorMansCopy(shadow);

    return shadow;
  };

  this.getShadow = function (id) {
    return shadows[id];
  };

  this.getBackup = function (id) {
    return backups[id];
  };

  this.getEdits = function (id, clientId) {
    if (!edits[id]) {
      return [];
    }

    return edits[id].filter(function (edit) {
      return edit.id === id && edit.clientId === clientId;
    });
  };

  this.saveShadowBackup = function (shadow, version) {
    var backup = {id: shadow.id, version: version, content: shadow.content};
    backups[shadow.id] = utils.poorMansCopy(backup);
    return backup;
  };

  /**
   * Saves an Edit to the data store
   *
   * @param edit - the edit to store
   */
  this.saveEdit = function (edit) {
    if (edits[edit.id]) {
      edits[edit.id].push(edit);
    } else {
      edits[edit.id] = [edit];
    }
  };

  /**
   * Removes an edit
   *
   * @param edit - the edit to store
   */
  this.removeEdit = function (edit) {
    if (edits[edit.id]) {
      edits[edit.id].forEach(function (value, index, object) {
        if (edit.clientId === value.clientId) {
          object.splice(index, 1);
        }
      });
    }
  };
};

module.exports = InMemoryDataStore;

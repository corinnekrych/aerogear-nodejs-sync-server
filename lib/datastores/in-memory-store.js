/**
 * A server side {@link DataStore} implementation is responsible for storing
 * and serving data for a Differential Synchronization implementation.
 *
 * @constructor
 */
var InMemoryDataStore = function () {
  var stores = { docs: [], shadows: [], backups: [], edits: [] };

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
    return this._readData(docId, 'docs');
  };

  /**
   * Saves a server document.
   *
   * @param doc - the document to store
   * @returns {Boolean} - true if the document was stored
   */
  this.saveDocument = function (doc) {
    var existingDoc = this.getDocument(doc.id);
    if (!existingDoc.length) {
      this._saveData(doc, 'docs');
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
      this.saveDocument(doc);
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

    this._saveData(shadow, 'shadows');
    return shadow;
  };

  this.getShadow = function (id) {
    return this._readData(id, 'shadows')[0];
  };

  this.getBackup = function (id) {
    return this._readData(id, 'backups')[0];
  };

  this.saveShadowBackup = function (shadow, version) {
    var backup = {id: shadow.id, version: version, content: shadow.content};
    this._saveData(backup, 'backups');
    return backup;
  };

  this._saveData = function (doc, docType) {
    doc = Array.isArray(doc) ? doc : [doc];
    stores[docType] = doc;
  };

  this._readData = function (id, type) {
    return stores[type].filter(function (doc) {
      return doc.id === id;
    });
  };

  this.getEdits = function (id) {
    var patchMessages = this._readData(id, 'edits');
    return patchMessages.length ? patchMessages.edits : [];
  };
};

module.exports = InMemoryDataStore;

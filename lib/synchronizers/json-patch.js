var jsonpatch = require('fast-json-patch');

/**
 * A Synchronizer that uses the [JSON-Patch]{@link https://tools.ietf.org/html/rfc6902}
 * which allows updates to JSON documents by sending the changes instead of sending the
 * whole document.
 */
var JSONPatchSynchronizer = function (options) {
  if (!(this instanceof JSONPatchSynchronizer)) {
    return new JSONPatchSynchronizer(options);
  }

  /**
   * Called when the shadow should be patched. Is called when an update is recieved.
   *
   * @param edit - the edits to be applied
   * @param shadowDoc - the shadow document to patch (apply the edits to)
   * @return shadowDoc - the patched shadow document
   */
  this.patchShadow = function (edit, shadowDoc) {
    jsonpatch.apply(shadowDoc.content, edit.diff);
    return shadowDoc;
  };

  /**
   * Called when the document should be patched.
   *
   * @param edit - the edits to be applied
   * @param doc - the document to patch (apply the edits to)
   * @return doc - the patched document
   */
  this.patchDocument = function (edit, doc) {
    jsonpatch.apply(doc.content, edit.diff);
    return doc;
  };

  /**
   * The first step in a sync is to produce a an edit for the changes.
   * The produced edit can then be sent to the opposing side perform an update/sync.
   *
   * @param doc - the document to patch (apply the edits to)
   * @param shadowDoc - the shadow document to patch (apply the edits to)
   */
  this.serverDiff = function (doc, shadowDoc) {
    return {
      clientVersion: shadowDoc.clientVersion,
      serverVersion: shadowDoc.serverVersion,
      checksum: shadowDoc.checksum,
      diff: jsonpatch.compare(doc.content, shadowDoc.content)
    };
  };

  /**
   * Is called to produce an {@link Edit} of changes coming from a client.
   *
   * @param doc - the document do diff
   * @param shadowDoc - the document shadow containing the client changes.
   * @return edit - the edit representing the diff between the document and it's shadow document.
   */
  this.clientDiff = function (doc, shadowDoc) {
    return {
      clientVersion: 0,
      serverVersion: 0,
      checksum: '',
      diff: jsonpatch.compare(doc.content, shadowDoc.content)
    };
  };

  /**
   * Creates a new PatchMessage with the with the type of Edit that this
   * synchronizer can handle.
   *
   * @param docId - the document identifier for the {@code PatchMessage}
   * @param clientId - the client identifier for the {@code PatchMessage}
   * @param edits - the {@link Edit}s for the {@code PatchMessage}
   * @return PatchMessage - the created {code PatchMessage}
   */
  this.createPatchMessage = function (documentId, clientId, edits) {
    return {
      documentId: documentId,
      clientId: clientId,
      edits: edits
    };
  };

  return this;
};

module.exports = JSONPatchSynchronizer;

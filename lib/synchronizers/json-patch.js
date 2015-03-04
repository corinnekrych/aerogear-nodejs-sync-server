var jsonpatch = require('fast-json-patch');

var JSONPatchSynchronizer = function (options) {
    if (!(this instanceof JSONPatchSynchronizer)) {
        return new JSONPatchSynchronizer(options);
    }

    this.patchShadow = function (edit, shadowDocument) {
        jsonpatch.apply(shadowDocument.document.content, edit.diff);
        return shadowDocument;
    };

    this.patchDocument = function (edit, document) {
        jsonpatch.apply(document.content, edit.diff);
        return document;
    };

    this.serverDiff = function (document, shadowDocument) {
        return {
            clientVersion: shadowDocument.clientVersion,
            serverVersion: shadowDocument.serverVersion,
            checksum: shadowDocument.checksum,
            diff: jsonpatch.compare(document.content, shadowDocument.document.content)
        };
    };

    this.clientDiff = function (document, shadowDocument) {
        return {
            clientVersion: 0,
            serverVersion: 0,
            checksum: '',
            diff: jsonpatch.compare(document.content, shadowDocument.document.content)
        };
    };

    this.createPatchMessage = function (documentId, clientId, edits) {
        return {
            documentId: documentId,
            clientId: clientId,
            edits: edits
        };
    };

    this.patchMessageFromJson = function () {};

    this.documentFromJson = function () {};

    return this;
};

module.exports = JSONPatchSynchronizer;

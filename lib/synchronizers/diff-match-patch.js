var diffMatchPatch = require('diff-match-patch');

var dmp = new diffMatchPatch();

function asDmpOperation(op) {
    if (op === 'DELETE') {
        return -1;
    } else if (op === 'ADD') {
        return 1;
    }
    return 0;
}

function asDiffMatchPathDiffs(diffs) {
    return diffs.map(function (value) {
        return [asDmpOperation(value.operation), value.text];
    });
}

function asAgOperation(op) {
    if (op === -1) {
        return 'DELETE';
    } else if (op === 1) {
        return 'ADD';
    }
    return 'UNCHANGED';
}

function asAeroGearDiffs(diffs) {
    return diffs.map(function (value) {
        return {
            operation: asAgOperation(value[0]),
            text: value[1]
        };
    });
}

function performDiff(doc, shadowDoc, type) {
    var diffDoc, patchMsg, docContent, shadowContent, pendingEdits, diff;

    if (typeof doc.content === 'string') {
        docContent = doc.content;
        shadowContent = shadowDoc.document.content;
    } else {
        docContent = JSON.stringify(doc.content);
        shadowContent = JSON.stringify(shadowDoc.document.content);
    }

    if (type === 'server') {
        diff = dmp.diff_main(shadowContent, docContent);
    } else {
        diff = dmp.diff_main(docContent, shadowContent);
    }

    return {
        clientVersion: shadowDoc.clientVersion,
        serverVersion: shadowDoc.serverVersion,
        // currently not implemented but we probably need this for checking the client and server shadow are identical be for patching.
        checksum: '',
        diff: asAeroGearDiffs(diff)
    };
}

function patch(edit, content) {
    var diffs, patches, patchResult, shadowContent;

    content = typeof content === 'string' ? content : JSON.stringify(content);

    diffs = asDiffMatchPathDiffs(edit.diff);
    patches = dmp.patch_make(content, diffs);
    patchResult = dmp.patch_apply(patches, content);

    try {
        shadowContent = JSON.parse(patchResult[0]);
    } catch (e) {
        shadowContent = patchResult[0];
    }

    return shadowContent;
}

var DiffMatchPatchSynchronizer = function (options) {
    if (!(this instanceof DiffMatchPatchSynchronizer)) {
        return new DiffMatchPatchSynchronizer(options);
    }

    this.patchShadow = function (edit, shadowDocument, source) {
        shadowDocument.document.content = patch(edit, source ? source.content : shadowDocument.document.content);
        return shadowDocument;
    };

    this.patchDocument = function (edit, source) {
        source.content = patch(edit, source.content);
        return source;
    };

    this.serverDiff = function (doc, shadowDoc) {
        return performDiff(doc, shadowDoc, 'server');
    };

    this.clientDiff = function (doc, shadowDoc) {
      return performDiff(doc, shadowDoc, 'client');
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

module.exports = DiffMatchPatchSynchronizer;

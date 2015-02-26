var diffMatchPatch = require('diff-match-patch'),
    utils = require('../utils');


var SEEDED_CLIENT_VERSION = -1;
var SEEDED_SERVER_VERSION = 1;

var ServerSyncEngine = function () {
    if (!(this instanceof ServerSyncEngine)) {
        return new ServerSyncEngine();
    }

    var stores = {
        docs: [],
        shadows: [],
        backups: [],
        edits: []
    },
    dmp = new diffMatchPatch();

    this.saveDocument = function (doc) {
        var existingDoc = this.getDocument(doc.id, 'docs');
        if (!existingDoc.length) {
            this.saveData(doc, 'docs');
            return false;
        }

        return true;
    };

    this.saveShadow = function (doc) {
        var shadow = {
            id: doc.id,
            serverVersion: doc.serverVersion || 0,
            clientId: doc.clientId,
            clientVersion: doc.clientVersion || 0,
            content: doc.content
        };

        this.saveData(shadow, 'shadows');
        return shadow;
    };

    this.saveShadowBackup = function (shadow, version) {
        var backup = {id: shadow.id, version: version, content: shadow.content};
        this.saveData(backup, 'backups');
        return backup;
    };


    this.getDocument = function (docId) {
        return this._readData(docId, 'docs');
    };


    this.saveData = function (doc, docType) {
        doc = Array.isArray(doc) ? doc : [doc];

        stores[docType] = doc;
    };

    this.serverDiff = function (doc, shadow) {
        var diffDoc, patchMsg, docContent, shadowContent, pendingEdits;

        if (typeof doc.content === 'string') {
            docContent = doc.content;
            shadowContent = shadow.content;
        } else {
            docContent = JSON.stringify(doc.content);
            shadowContent = JSON.stringify(shadow.content);
        }

        patchMsg = {
            msgType: 'patch',
            id: doc.id,
            clientId: shadow.clientId,
            edits: [{
                clientVersion: shadow.clientVersion,
                serverVersion: shadow.serverVersion,
                // currently not implemented but we probably need this for checking the client and server shadow are identical be for patching.
                checksum: '',
                diffs: this._asAeroGearDiffs(dmp.diff_main(shadowContent, docContent))
            }]
        };

        // add any pending edits from the store
        pendingEdits = this._getEdits(doc.id);
        if (pendingEdits && pendingEdits.length > 0) {
            patchMsg.edits = pendingEdits.concat(patchMsg.edits);
        }

        return patchMsg;
    };

    this._asAeroGearDiffs = function (diffs) {
        return diffs.map(function (value) {
            return {
                operation: this._asAgOperation(value[0]),
                text: value[1]
            };
        }.bind(this));
    };

    this._asAgOperation = function (op) {
        if (op === -1) {
            return 'DELETE';
        } else if (op === 1) {
            return 'ADD';
        }
        return 'UNCHANGED';
    };

    this._readData = function (id, type) {
        return stores[type].filter(function (doc) {
            return doc.id === id;
        });
    };

    this._getEdits = function (id) {
        var patchMessages = this._readData(id, 'edits');

        return patchMessages.length ? patchMessages.edits : [];
    };

    this._seededShadowFrom = function (shadowDocument, doc) {
        var d = doc.content === null ? this.getDocument(doc.id)[0] : doc;
        return {
            id: d.id,
            clientId: shadowDocument.clientId,
            serverVersion: SEEDED_SERVER_VERSION,
            clientVersion: SEEDED_CLIENT_VERSION,
            content: d.content
        };
    };

    this.getShadow = function (id) {
        return this._readData(id, 'shadows')[0];
    };

    this.getBackup = function (id) {
        return this._readData(id, 'backups')[0];
    };

    return this;
};

ServerSyncEngine.prototype.addSubscriber = function (subscriber, document) {
    console.log('TODO: ADD SUBSCRIBER STUFF');
    return this.addDocument(document, subscriber.clientId);
};

ServerSyncEngine.prototype.addDocument = function (document, clientId) {
    var existing, existingDoc, shadowDocument, patchMessage, shadowCopy, magic;

    if (!document.content) {
        existingDoc = this.getDocument(document.id);

        if (!existingDoc.length) {
            patchMessage = {
                msgType: 'patch',
                id: document.id,
                clientId: clientId,
                edits: []
            };
        } else {
            shadowDocument = this.addShadowForClient(document.id, clientId);

            magic = this._seededShadowFrom(shadowDocument, document);
            patchMessage = this.serverDiff(shadowDocument, magic);

            // TODO : updateDocument(patchDocument(shadow));
        }

        return patchMessage;
    }

    // Save document,  and check if it already exists in our store
    existing = this.saveDocument(document);
    // Add Shadow for the client
    shadowDocument = this.addShadowForClient(document.id, clientId);

    if (existing) {
        console.log('Document with ID: ' + document.id + 'exists already');
        magic = this._seededShadowFrom(shadowDocument, document);
        patchMessage = this.serverDiff(shadowDocument, magic);
    } else {
        shadowCopy = utils.poorMansCopy(shadowDocument);
        shadowCopy.serverVersion++;
        patchMessage = this.serverDiff(shadowDocument, shadowCopy);
    }

    return patchMessage;
};

ServerSyncEngine.prototype.addShadowForClient = function (docId, clientId) {
    return this.addShadow(docId, clientId, 0);
};

ServerSyncEngine.prototype.addShadow = function (docId, clientId, clientVersion) {
    var currentDocument, shadowDocument;

    currentDocument = this.getDocument(docId, 'docs')[0];

    currentDocument.clientId = clientId;

    // Save Shadow
    shadowDocument = this.saveShadow(currentDocument);
    this.saveShadowBackup(currentDocument, 0);

    return shadowDocument;
};

ServerSyncEngine.prototype.diff = function (docId, clientId) {
    throw new Error('Diff Not Yet Implemeted');
};

ServerSyncEngine.prototype.patch = function (patchMessage) {
    throw new Error('Patch Not Yet Implemeted');
};

module.exports = ServerSyncEngine;

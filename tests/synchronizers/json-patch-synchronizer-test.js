var assert = require('assert'),
    jsonpatch = require('fast-json-patch'),
    JSONPatchSynchronizer = require('../../lib/synchronizers/json-patch');


describe('JSON Patch Synchronizer Tests', function () {
    describe('Create new JSON Patch Synchronizer', function () {
        it('create without new', function () {
            var jsonPatchSynchronizer = JSONPatchSynchronizer();
            assert.equal(jsonPatchSynchronizer instanceof JSONPatchSynchronizer, true, 'should be true');
        });
    });

    describe('JSON Patch Synchronizer methods', function () {
        var source, shadow, jsonPatchSynchronizer, diff, validDiff, patchMessage, patchDocument,
            documentId = '1234',
            clientId = 'client1';

        source = {
            documentId: documentId,
            clientId: clientId,
            content: {
                name: 'fletch'
            }
        };

        shadow = {
            document: {
                documentId: documentId,
                clientId: clientId,
                content: {
                    name: 'Fletch'
                }
            }
        };

        beforeEach(function () {
            jsonPatchSynchronizer = JSONPatchSynchronizer();
            source.content = {name: 'fletch'};
            validDiff = false;
        });

        it('test the client diff', function () {

            diff = jsonPatchSynchronizer.clientDiff(source, shadow).diff;
            validDiff = jsonpatch.apply(source.content, diff);

            assert.equal(source.content.name, 'Fletch');
            assert.equal(validDiff, true);
        });

        it('test the server diff', function () {
            diff = jsonPatchSynchronizer.serverDiff(source, shadow).diff;

            validDiff = jsonpatch.apply(source.content, diff);

            assert.equal(source.content.name, 'Fletch');
            assert.equal(validDiff, true);
        });

        it('test create patch message', function () {

            diff = jsonPatchSynchronizer.serverDiff(source, shadow);

            patchMessage = jsonPatchSynchronizer.createPatchMessage(documentId, clientId, [diff]);

            assert.equal(patchMessage.documentId, documentId);
            assert.equal(patchMessage.clientId, clientId);
            assert.equal(patchMessage.edits.length, 1);
            assert.equal(patchMessage.edits[0].diff, diff.diff);
            assert.equal(JSON.stringify(patchMessage.edits[0].diff), JSON.stringify(diff.diff));
        });

        it('test create patch document', function () {
            diff = jsonPatchSynchronizer.serverDiff(source, shadow);

            patchDocument = jsonPatchSynchronizer.patchDocument(diff, source);
            assert.equal(patchDocument.content.name, 'Fletch');
        });
    });
});

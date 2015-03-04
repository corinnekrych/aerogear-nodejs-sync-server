var assert = require('assert'),
    jsonpatch = require('fast-json-patch'),
    DiffMatchPatchSynchronizer = require('../../lib/synchronizers/diff-match-patch');


describe('Diff Match Patch Synchronizer Tests', function () {
    describe('Create new Diff Match Patch Synchronizer', function () {
        it('create without new', function () {
            var diffMatchPatchSynchronizer = DiffMatchPatchSynchronizer();
            assert.equal(diffMatchPatchSynchronizer instanceof DiffMatchPatchSynchronizer, true, 'should be true');
        });
    });

    describe('Diff Match Patch Synchronizer methods', function () {
        var source, shadow, diffMatchPatchSynchronizer, edit, validDiff, patchMessage, patchDocument, patchedShadow, patchedDocument,
            documentId = '1234',
            clientId = 'client1';

        source = {
            id: documentId,
            clientId: clientId
        };

        shadow = {
            document: {
                id: documentId,
                clientId: clientId
            }
        };

        beforeEach(function () {
            diffMatchPatchSynchronizer = DiffMatchPatchSynchronizer();
            source.content = null;
            shadow.document.content = null;
        });

        it('test the client diff', function () {
            source.content = 'test';

            shadow.clientVersion = 0;
            shadow.serverVersion = 0;
            shadow.document.content = 'testing';

            edit = diffMatchPatchSynchronizer.clientDiff(source, shadow);
            assert.equal(edit.clientVersion, 0);
            assert.equal(edit.serverVersion, 0);
            assert.equal(edit.diff.length, 2, 'should be 2 diffs');
            assert.equal(edit.diff[0].operation, 'UNCHANGED', 'first diff operation should be UNCHANGED');
            assert.equal(edit.diff[0].text, 'test', 'test text should remain unchanged');
            assert.equal(edit.diff[1].operation, 'ADD', 'second diff operation should be ADD');
            assert.equal(edit.diff[1].text, 'ing', 'added text is ing');
        });

        it('test the server diff', function () {
            source.content = 'test';

            shadow.clientVersion = 0;
            shadow.serverVersion = 0;
            shadow.document.content = 'testing';

            edit = diffMatchPatchSynchronizer.serverDiff(source, shadow);
            assert.equal(edit.clientVersion, 0);
            assert.equal(edit.serverVersion, 0);
            assert.equal(edit.diff.length, 2, 'should be 2 diffs');
            assert.equal(edit.diff[0].operation, 'UNCHANGED', 'first diff operation should be UNCHANGED');
            assert.equal(edit.diff[0].text, 'test', 'test text should remain unchanged');
            assert.equal(edit.diff[1].operation, 'DELETE', 'second diff operation should be DELETE');
            assert.equal(edit.diff[1].text, 'ing', 'deleted text is ing');
        });

        it('test patch shadow', function () {
            source.content = 'Beve';

            shadow.clientVersion = 0;
            shadow.serverVersion = 0;
            shadow.document.content = 'Cool Guy';


            edit = diffMatchPatchSynchronizer.serverDiff(source, shadow);
            patchedShadow = diffMatchPatchSynchronizer.patchShadow(edit, shadow);
            assert.equal(patchedShadow.document.content, 'Beve', 'shadow test should be test');
        });

        it('test patch shadow from client diff', function () {
            source.content = 'Beve';

            shadow.clientVersion = 0;
            shadow.serverVersion = 0;
            shadow.document.content = 'Cool Dude';


            edit = diffMatchPatchSynchronizer.clientDiff(source, shadow);
            patchedShadow = diffMatchPatchSynchronizer.patchShadow(edit, shadow, source);
            assert.equal(patchedShadow.document.content, 'Cool Dude', 'shadow test should be Cool Dude');
        });

        it('test patch document', function () {
            source.content = 'test';

            shadow.clientVersion = 0;
            shadow.serverVersion = 0;
            shadow.document.content = 'testing';


            edit = diffMatchPatchSynchronizer.clientDiff(source, shadow);
            patchedDocument = diffMatchPatchSynchronizer.patchDocument(edit, source);
            assert.equal(patchedDocument.content, 'testing', 'document test should be testing');
        });
    });
});

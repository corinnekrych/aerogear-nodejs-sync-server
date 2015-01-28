var assert = require('assert'),
    uuid = require('node-uuid'),
    util = require('../lib/utils'),
    ServerSyncEngine = require('../lib/server-sync-engine');

describe('Server Sync Engine Tests', function () {
    describe('Object Creation', function () {
        it('Create without new', function () {
            var serverSyncEngine = ServerSyncEngine();

            assert.equal(serverSyncEngine instanceof ServerSyncEngine, true, 'should be true');
        });
    });

    describe('Add Document', function () {
        var serverSyncEngine, subscriber,
            doc = {
                id: '1234'
            };

        beforeEach(function () {
            serverSyncEngine = ServerSyncEngine();
            subscriber = {
                clientId: uuid.v4()
            };
            doc.content = null;
        });

        it('content as a String', function () {
            doc.content = 'Mr. Rosen';
            var patchMessage = serverSyncEngine.addSubscriber(subscriber, doc);

            assert(patchMessage.edits, true, 'edits should be there');
            assert.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'should be an UNCHANGED operation');
            assert.equal(patchMessage.edits[0].diffs[0].text, doc.content, 'content should be unchanged');
            assert.equal(patchMessage.clientId, subscriber.clientId, 'client ID\'s should match');
        });

        it('no content and no pre-existing data', function () {
            var patchMessage = serverSyncEngine.addSubscriber(subscriber, doc);

            assert.equal(patchMessage.edits.length, 0, 'edits should be empty');
            assert.equal(patchMessage.clientId, subscriber.clientId, 'client ID\'s should match');

        });

        it('no content with pre-existing data', function () {
            doc.content = 'Mr. Rosen';
            serverSyncEngine.addSubscriber(subscriber, util.poorMansCopy(doc));

            doc.content = null;
            var patchMessage = serverSyncEngine.addSubscriber(subscriber, doc);
            assert(patchMessage.edits, true, 'edits should be there');
            assert.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'should be an UNCHANGED operation');
            assert.equal(patchMessage.edits[0].diffs[0].text, 'Mr. Rosen', 'content should be unchanged');
            assert.equal(patchMessage.clientId, subscriber.clientId, 'client ID\'s should match');
        });

        it('content with pre-existing data', function (){
            doc.content = 'Mr. Rosen';
            serverSyncEngine.addSubscriber(subscriber, doc);

            var doc2 = {
                id: '1234',
                content: 'Some New Content'
            };

            var patchMessage = serverSyncEngine.addSubscriber(subscriber, doc2);
            var edits = patchMessage.edits;

            assert.equal(edits.length, 1, 'edit array should have 1 value');

            var diffs = edits[0].diffs;

            assert.equal(diffs instanceof Array, true, 'diffs should be an array');
            assert.equal(diffs[0].operation, 'DELETE', 'should be a DELETE Operation');
            assert.equal(diffs[0].text, 'Some', 'text should be Some');
            assert.equal(diffs[1].operation, 'ADD', 'should be an ADD Operation');
            assert.equal(diffs[1].text, 'Mr.', 'text should be Mr.');
            assert.equal(diffs[2].operation, 'UNCHANGED', 'should be an UNCHANGED Operation');
            assert.equal(diffs[2].text, ' ', 'text should be \' \' ');
            assert.equal(diffs[3].operation, 'DELETE', 'should be a DELETE Operation');
            assert.equal(diffs[3].text, 'New C', 'text should be New C');
            assert.equal(diffs[4].operation, 'ADD', 'should be an ADD Operation');
            assert.equal(diffs[4].text, 'R', 'text should be R');
            assert.equal(diffs[5].operation, 'UNCHANGED', 'should be an UNCHANGED Operation');
            assert.equal(diffs[5].text, 'o', 'text should be o');
            assert.equal(diffs[6].operation, 'DELETE', 'should be a DELETE Operation');
            assert.equal(diffs[6].text, 'nt', 'text should be nt');
            assert.equal(diffs[7].operation, 'ADD', 'should be an ADD Operation');
            assert.equal(diffs[7].text, 's', 'text should be s');
            assert.equal(diffs[8].operation, 'UNCHANGED', 'should be an UNCHANGED Operation');
            assert.equal(diffs[8].text, 'en', 'text should be en');
            assert.equal(diffs[9].operation, 'DELETE', 'should be a DELETE Operation');
            assert.equal(diffs[9].text, 't', 'text should be t');
        });

        it('verify shadow', function () {
            doc.content = {name: 'Mr. Babar'};
            var patchMessage = serverSyncEngine.addSubscriber(subscriber, doc);

            var shadowDocument = serverSyncEngine.getShadow(doc.id, subscriber.clientId);
            assert.equal(shadowDocument.id, doc.id, 'ids should be the same');
            assert.equal(shadowDocument.clientId, doc.clientId, 'clientIds should be the same');
            assert.equal(shadowDocument.serverVersion, 0, 'server version should be the 0');
            assert.equal(shadowDocument.clientVersion, 0, 'client version should be the 0');
            assert.equal(JSON.stringify(shadowDocument.content), JSON.stringify(doc.content), 'content should be equal');

            var shadowBackup = serverSyncEngine.getBackup(doc.id, subscriber.clientId);
            assert.equal(shadowBackup.version, 0, 'version should be 0');
            assert.equal(shadowBackup.content, shadowDocument.content);
        });
    });

    describe('diff', function () {
    });

    describe('patch', function () {
        it('patch', function () {
        });

        it('patch version already on the server', function () {
        });

        it('patch multiple versions', function () {
        });

        it('patch revert to backup', function () {
        });
    });
});



var assert = require('assert'),
    uuid = require('node-uuid'),
    DiffSyncHandler = require('../lib/diff-sync-handler');

describe('Diff Sync Handler tests', function () {
    describe('Creation of Handler', function () {
        it('can create with out new', function () {
            var syncHandler = DiffSyncHandler();

            assert.equal(syncHandler instanceof DiffSyncHandler, true);
        });

        it('should be an event emitter', function () {
            var syncHandler = DiffSyncHandler();

            assert(syncHandler.emit, 'synchandler should inherit from EventEmitter');
        });
    });

    describe('unkown patchMessage Type', function () {
        var syncHandler;

        beforeEach(function () {
            syncHandler = DiffSyncHandler();
        });

        it('should return a unknown patchMessage', function (done) {
            syncHandler.on('send', function (patchMessage) {
                assert.equal('Unknown msgType undefined', patchMessage);
                done();
            });

            syncHandler.messageReceived('unknown');

        });

        it('should return a unknown patchMessage for an unknown patchMessage type', function (done) {
            syncHandler.on('send', function (patchMessage) {
                assert.equal('Unknown msgType unknown', patchMessage);
                done();
            });

            syncHandler.messageReceived(JSON.stringify({msgType: 'unknown'}));
        });
    });

    describe('Add a Dcouemt', function () {
        var payload = {
            msgType: 'add',
            clientId: 'clientId1',
        };

        beforeEach(function () {
            payload.content = null;
            payload.id = uuid.v4();
        });

        it('should add a document with content of string', function (done) {
            var syncHandler = DiffSyncHandler();

            payload.content = 'Once upon a time';

            syncHandler.on('send', function (patchMessage) {
                assert.equal(patchMessage.id, payload.id, 'ids should match');
                assert.equal(patchMessage.clientId, payload.clientId, ' client ids should match');
                assert.equal(patchMessage.edits.length, 1, 'edits should have 1 value');
                assert.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'should be an UNCHANGED operation');
                assert.equal(patchMessage.edits[0].diffs[0].text, payload.content, 'content should be unchanged');
                done();
            });

            syncHandler.messageReceived(JSON.stringify(payload));
        });

        it('should add a document with content of an Object', function (done) {
            var syncHandler = DiffSyncHandler();

            payload.content = {
                name: 'Dr. Rosen'
            };

            syncHandler.on('send', function (patchMessage) {
                assert.equal(patchMessage.id, payload.id, 'ids should match');
                assert.equal(patchMessage.clientId, payload.clientId, ' client ids should match');
                assert.equal(patchMessage.edits.length, 1, 'edits should have 1 value');
                assert.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'should be an UNCHANGED operation');
                assert.equal(patchMessage.edits[0].diffs[0].text, JSON.stringify(payload.content), 'content should be unchanged');
                done();
            });

            syncHandler.messageReceived(JSON.stringify(payload));
        });

        it('should add a document with content of an Array', function (done) {
            var syncHandler = DiffSyncHandler();

            payload.content = [
                'One', 'Two'
            ];

            syncHandler.on('send', function (patchMessage) {
                assert.equal(patchMessage.id, payload.id, 'ids should match');
                assert.equal(patchMessage.clientId, payload.clientId, ' client ids should match');
                assert.equal(patchMessage.edits.length, 1, 'edits should have 1 value');
                assert.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'should be an UNCHANGED operation');
                assert.equal(patchMessage.edits[0].diffs[0].text, JSON.stringify(payload.content), 'content should be unchanged');
                done();
            });

            syncHandler.messageReceived(JSON.stringify(payload));
        });

        it('should add a document that already exists', function (done) {
            var syncHandler = DiffSyncHandler();

            payload.content = [
                'One', 'Two'
            ];

            syncHandler.on('send', function (patchMessage) {
                assert.equal(patchMessage.id, payload.id, 'ids should match');
                assert.equal(patchMessage.clientId, payload.clientId, ' client ids should match');
                assert.equal(patchMessage.edits.length, 1, 'edits should have 1 value');
                assert.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'should be an UNCHANGED operation');
                assert.equal(patchMessage.edits[0].diffs[0].text, JSON.stringify(payload.content), 'content should be unchanged');
                done();
            });

            syncHandler.messageReceived(JSON.stringify(payload));
        });
    });
});


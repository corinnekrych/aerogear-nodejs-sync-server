'use strict';

const test = require('tape');
const uuid = require('node-uuid');
const SyncHandler = require('../lib/sync-handler.js');
const SyncEngine = require('../lib/sync-engine.js');
const InMemoryDataStore = require('../lib/datastores/in-memory-store.js');
const DiffMatchPatchSynchronizer = require('../lib/synchronizers/diff-match-patch.js');

test('[sync-handler] create new SyncHandler', function (t) {
  const handler = new SyncHandler(createSyncEngine());
  t.ok(handler instanceof SyncHandler, 'should be an instance of SyncHandler');
  t.ok(handler.emit, 'should inherit from EventEmitter');
  t.end();
});

test('[sync-handler] messageReceived: undefined', function (t) {
  const handler = new SyncHandler(createSyncEngine());
  handler.on('error', function (error) {
    t.ok(error, error.message);
    t.end();
  });
  handler.messageReceived();
});

test('[sync-handler] messageRecieved: msgType add', function (t) {
  const payload = {
    id: uuid.v4(),
    clientId: uuid.v4(),
    msgType: 'add',
    content: 'stop calling me Shirley'
  };
  const handler = new SyncHandler(createSyncEngine());
  handler.on('send', function (patchMessage) {
    t.equal(patchMessage.msgType, 'patch', 'msgType should be patch');
    t.equal(patchMessage.id, payload.id, 'id\'s should match');
    t.equal(patchMessage.clientId, payload.clientId, 'clientId\'s should match');
    t.equal(patchMessage.edits.length, 1, 'should be one edit');
    t.equal(patchMessage.edits[0].serverVersion, 0, 'edit serverVersion should be 0');
    t.equal(patchMessage.edits[0].clientVersion, 1, 'edit clientVersion should be 1');
    t.equal(patchMessage.edits[0].checksum, undefined, 'TODO: implement checksum');
    t.equal(patchMessage.edits[0].diffs.length, 1, 'edit should contain one diff');
    t.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'operation should be UNCHANGED');
    t.end();
  });
  handler.messageReceived(JSON.stringify(payload));
});

test('[sync-handler] messageRecieved: msgType add object content', function (t) {
  const payload = {
    id: uuid.v4(),
    clientId: uuid.v4(),
    msgType: 'add',
    content: {
      name: 'Dr. Rosen'
    }
  };
  const handler = new SyncHandler(createSyncEngine());
  handler.on('send', function (patchMessage) {
    t.equal(patchMessage.msgType, 'patch', 'msgType should be patch');
    t.equal(patchMessage.id, payload.id, 'id\'s should match');
    t.equal(patchMessage.clientId, payload.clientId, 'clientId\'s should match');
    t.equal(patchMessage.edits.length, 1, 'should be one edit');
    t.equal(patchMessage.edits[0].serverVersion, 0, 'edit serverVersion should be 0');
    t.equal(patchMessage.edits[0].clientVersion, 1, 'edit clientVersion should be 1');
    t.equal(patchMessage.edits[0].checksum, undefined, 'TODO: implement checksum');
    t.equal(patchMessage.edits[0].diffs.length, 1, 'edit should contain one diff');
    t.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'operation should be UNCHANGED');
    t.end();
  });
  handler.messageReceived(JSON.stringify(payload));
});

test('[sync-handler] messageRecieved: msgType add array content', function (t) {
  const payload = {
    id: uuid.v4(),
    clientId: uuid.v4(),
    msgType: 'add',
    content: ['one', 'two', 'three']
  };
  const handler = new SyncHandler(createSyncEngine());
  handler.on('send', function (patchMessage) {
    t.equal(patchMessage.msgType, 'patch', 'msgType should be patch');
    t.equal(patchMessage.id, payload.id, 'id\'s should match');
    t.equal(patchMessage.clientId, payload.clientId, 'clientId\'s should match');
    t.equal(patchMessage.edits.length, 1, 'should be one edit');
    t.equal(patchMessage.edits[0].serverVersion, 0, 'edit serverVersion should be 0');
    t.equal(patchMessage.edits[0].clientVersion, 1, 'edit clientVersion should be 1');
    t.equal(patchMessage.edits[0].checksum, undefined, 'TODO: implement checksum');
    t.equal(patchMessage.edits[0].diffs.length, 1, 'edit should contain one diff');
    t.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'operation should be UNCHANGED');
    t.end();
  });
  handler.messageReceived(JSON.stringify(payload));
});

function createSyncEngine () {
  return new SyncEngine(new DiffMatchPatchSynchronizer(),
                        new InMemoryDataStore());
}

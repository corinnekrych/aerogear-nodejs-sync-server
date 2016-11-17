'use strict';

const test = require('tape');
const InMemoryDataStore = require('../lib/datastores/in-memory-store.js');
const DiffMatchPatchSynchronizer = require('../lib/synchronizers/diff-match-patch.js');
const uuid = require('node-uuid');
const SyncEngine = require('../lib/sync-engine.js');

test('[server-sync-engine] create new SyncEngine', function (t) {
  const synchronizer = new DiffMatchPatchSynchronizer();
  const datastore = new InMemoryDataStore();
  const syncEngine = new SyncEngine(synchronizer, datastore);
  t.ok(syncEngine instanceof SyncEngine, 'should be instance of SyncEngine');
  t.end();
});

test('[server-sync-engine] create SyncEngine without new', function (t) {
  const synchronizer = new DiffMatchPatchSynchronizer();
  const datastore = new InMemoryDataStore();
  const syncEngine = SyncEngine(synchronizer, datastore);
  t.ok(syncEngine instanceof SyncEngine, 'should be instance of SyncEngine');
  t.end();
});

test('[server-sync-engine] addDocument empty content', function (t) {
  const syncEngine = new SyncEngine(new DiffMatchPatchSynchronizer(),
                                    new InMemoryDataStore());
  const clientId = uuid.v4();
  const doc = {
    id: '1234'
  };
  const patchMessage = syncEngine.addDocument(doc, clientId);
  t.equal(patchMessage.id, doc.id, 'document id should match');
  t.equal(patchMessage.edits.length, 0, 'should be no edits');
  t.equal(patchMessage.clientId, clientId, 'client id should match');
  t.end();
});

test('[server-sync-engine] addDocument', function (t) {
  const syncEngine = new SyncEngine(new DiffMatchPatchSynchronizer(),
                                    new InMemoryDataStore());
  const clientId = uuid.v4();
  const doc = {
    id: '1234',
    content: 'A long time ago in a galaxy far, far away....'
  };
  const patchMessage = syncEngine.addDocument(doc, clientId);

  t.equal(patchMessage.edits.length, 1, 'should be one edit');
  t.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'should be an \'UNCHANGED\' operation');
  t.equal(patchMessage.edits[0].diffs[0].text, doc.content, 'content should be unchanged');
  t.equal(patchMessage.clientId, clientId, 'client id should match');

  t.end();
});

test('[server-sync-engine] addDocument multiple times verify seeded', function (t) {
  const syncEngine = new SyncEngine(new DiffMatchPatchSynchronizer(),
                                    new InMemoryDataStore());
  const clientId = uuid.v4();
  const doc = {
    id: '1234',
    content: 'A long time ago in a galaxy far, far away....'
  };
  syncEngine.addDocument(doc, clientId);
  const patchMessage = syncEngine.addDocument(doc, 'client2');
  t.equal(patchMessage.edits.length, 1, 'should be one edit');
  t.equal(patchMessage.edits[0].clientVersion, -1, 'client version should be -1');
  t.equal(patchMessage.edits[0].serverVersion, 1, 'server version should be 1');
  t.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'should be an \'UNCHANGED\' operation');
  t.equal(patchMessage.edits[0].diffs[0].text, doc.content, 'content should be unchanged');
  t.equal(patchMessage.clientId, 'client2', 'client id should match');

  t.end();
});

/**
 * Calling addDocument with the document id of an already existing document, allows
 * for clients to "attach" to a current document without having to provide an empty
 * document content when using subscribe.
 */
test('[server-sync-engine] addDocument twice second time without content', function (t) {
  const syncEngine = new SyncEngine(new DiffMatchPatchSynchronizer(),
                                    new InMemoryDataStore());
  const clientId = uuid.v4();
  const doc = {
    id: '1234',
    content: 'A long time ago in a galaxy far, far away....'
  };
  syncEngine.addDocument(doc, clientId);
  const noContent = {
    id: '1234'
  };
  const patchMessage = syncEngine.addDocument(noContent, 'client2');
  t.equal(patchMessage.edits.length, 1, 'should be one edit');
  t.equal(patchMessage.edits[0].clientVersion, -1, 'client version should be -1');
  t.equal(patchMessage.edits[0].serverVersion, 1, 'server version should be 1');
  t.equal(patchMessage.edits[0].diffs[0].operation, 'UNCHANGED', 'should be an \'UNCHANGED\' operation');
  t.equal(patchMessage.edits[0].diffs[0].text, doc.content, 'content should be unchanged');
  t.equal(patchMessage.clientId, 'client2', 'client id should match');

  t.end();
});

test('[server-sync-engine] addDocument empty content but document already exists', function (t) {
  const synchronizer = new DiffMatchPatchSynchronizer();
  const syncEngine = new SyncEngine(synchronizer, new InMemoryDataStore());
  const docId = '1234';
  const doc = {
    id: docId,
    content: 'A long time ago in a galaxy far, far away....'
  };
  syncEngine.addDocument(doc, uuid.v4());

  const updatedDoc = {
    id: docId,
    content: 'Turmoil has engulfed the Galactic Republic'
  };
  const patchMessage = syncEngine.addDocument(updatedDoc, uuid.v4());
  t.equal(patchMessage.edits.length, 1, 'should be one edit');
  const edit = patchMessage.edits[0];
  t.equal(edit.diffs.length, 34, '34 operations should have been returned');
  var patched = synchronizer.patchDocument(edit, updatedDoc);
  t.equal(patched.content, doc.content, 'second doc should have been patched');
  t.end();
});

test('[server-sync-engine] verify shadow', function (t) {
  const synchronizer = new DiffMatchPatchSynchronizer();
  const syncEngine = new SyncEngine(synchronizer, new InMemoryDataStore());
  const clientId = uuid.v4();
  const doc = {
    id: '1234',
    content: 'A long time ago in a galaxy far, far away....'
  };
  syncEngine.addDocument(doc, clientId);
  const shadow = syncEngine.getShadow(doc.id, clientId);
  t.equal(shadow.id, doc.id, 'id\'s should be the same');
  t.equal(shadow.clientId, shadow.clientId, 'clientId\'s should be the same');
  t.equal(shadow.serverVersion, 0, 'server version should be 0');
  t.equal(shadow.clientVersion, 0, 'client version should be 0');
  t.equal(shadow.content, doc.content, 'content should be the same');

  const shadowBackup = syncEngine.getBackup(doc.id, clientId);
  t.equal(shadowBackup.version, 0, 'backup version should be 0');
  t.equal(shadowBackup.content, doc.content, 'content should be the same');
  t.end();
});

test('[server-sync-engine] diff', function (t) {
  const synchronizer = new DiffMatchPatchSynchronizer();
  const syncEngine = new SyncEngine(synchronizer, new InMemoryDataStore());
  const clientId = uuid.v4();
  var doc = {
    id: '1234',
    content: 'A long time ago in a galaxy far, far away....'
  };
  doc.content = 'bajja';
  syncEngine.addDocument(doc, clientId);
  const edit = syncEngine.diff(doc.id, clientId);
  t.equal(edit.serverVersion, 0);
  t.equal(edit.clientVersion, 0);
  t.equal(edit.diffs.length, 1);
  t.equal(edit.diffs[0].operation, 'UNCHANGED');
  t.end();
});

test('[server-sync-engine] patch', function (t) {
  const synchronizer = new DiffMatchPatchSynchronizer();
  const syncEngine = new SyncEngine(synchronizer, new InMemoryDataStore());
  const clientId = uuid.v4();
  const doc = {
    id: '1234',
    content: 'stop calling me shirley'
  };
  syncEngine.addDocument(doc, clientId);
  const shadow = {
    id: doc.id,
    clientId: doc.clientId,
    clientVersion: 0,
    serverVersion: 0,
    content: 'stop calling me Shirley'
  };
  const edit = synchronizer.clientDiff(doc, shadow);
  const patchMessage = {
    msgType: 'patch',
    id: doc.id,
    clientId: doc.clientId,
    edits: [edit]
  };
  syncEngine.patch(patchMessage);
  const patched = syncEngine.getDocument(doc.id);
  t.equal(patched.content, 'stop calling me Shirley');
  t.end();
});

test('[server-sync-engine] patch but server already has the client version', function (t) {
  const synchronizer = new DiffMatchPatchSynchronizer();
  const datastore = new InMemoryDataStore();
  const syncEngine = new SyncEngine(synchronizer, datastore);
  const clientId = uuid.v4();
  const doc = {
    id: '1234',
    content: 'stop calling me shirley'
  };
  syncEngine.addDocument(doc, clientId);
  const shadow = {
    id: doc.id,
    clientId: doc.clientId,
    clientVersion: 0,
    serverVersion: 0,
    content: 'stop calling me Shirley'
  };
  const edit = synchronizer.clientDiff(doc, shadow);
  const patchMessage = {
    msgType: 'patch',
    id: doc.id,
    clientId: doc.clientId,
    edits: [edit]
  };
  syncEngine.patch(patchMessage);
  // call again with the same patch message
  syncEngine.patch(patchMessage);
  const patched = syncEngine.getDocument(doc.id);
  t.equal(patched.content, 'stop calling me Shirley');
  t.equal(datastore.getEdits(doc.id, clientId).length, 0);
  t.end();
});

test('[server-sync-engine] restore backup when client hold old serverVersion', function (t) {
  const synchronizer = new DiffMatchPatchSynchronizer();
  const syncEngine = new SyncEngine(synchronizer, new InMemoryDataStore());
  const clientId = uuid.v4();
  const doc = {
    id: '1234',
    content: 'stop calling me shirley',
    clientVersion: 2,
    serverVersion: 2
  };
  syncEngine.addDocument(doc, clientId);
  // simulate inconsistent state, backup still on "old" serverVersion
  syncEngine.getBackup(doc.id).version = 1;
  const shadow = {
    id: doc.id,
    clientId: doc.clientId,
    clientVersion: 1,
    serverVersion: 1,
    content: 'stop calling me Shirley'
  };
  const edit = synchronizer.clientDiff(doc, shadow);
  const patchMessage = {
    msgType: 'patch',
    id: doc.id,
    clientId: doc.clientId,
    edits: [edit]
  };
  syncEngine.patch(patchMessage);
  const patched = syncEngine.getDocument(doc.id);
  t.equal(patched.content, 'stop calling me Shirley');
  t.end();
});
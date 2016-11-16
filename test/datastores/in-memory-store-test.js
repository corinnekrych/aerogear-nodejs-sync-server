'use strict';

var test = require('tape');
var InMemoryStore = require('../../lib/datastores/in-memory-store.js');

test('[in-memory-store] create store without using new', function (t) {
  t.ok(InMemoryStore(), 'instance was created even without using new');
  t.end();
});

test('[in-memory-store] saveDocument', function (t) {
  var store = new InMemoryStore();
  const document = doc(1, 'It is a dark time for the Rebellion');
  t.ok(store.saveDocument(document), 'Document was saved');

  t.end();
});

test('[in-memory-store] getDocument', function (t) {
  var store = new InMemoryStore();
  const document = doc(1, 'It is a dark time for the Rebellion');
  store.saveDocument(document);

  const readDoc = store.getDocument(document.id);
  t.equals(readDoc.id, document.id);
  t.equals(readDoc.content, document.content);

  t.end();
});

test('[in-memory-store] updateDocument', function (t) {
  var store = new InMemoryStore();
  var document = doc(1, 'It is a dark time for the Rebellion');
  store.saveDocument(document);

  document.content = document.content + '.';
  store.updateDocument(document);

  const readDoc = store.getDocument(document.id);
  t.equals(readDoc.id, document.id);
  t.equals(readDoc.content, document.content);

  t.end();
});

test('[in-memory-store] saveEdit', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const edit = {
    id: docId,
    clientId: clientId,
    diffs: []
  };
  store.saveEdit(edit);
  const edits = store.getEdits(docId, clientId);
  t.equals(edits[0].id, docId);
  t.equals(edits[0].clientId, clientId);
  t.end();
});

test('[in-memory-store] saveEdit existing edits', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const edit1 = {
    id: docId,
    clientId: clientId,
    diffs: []
  };
  const edit2 = {
    id: docId,
    clientId: clientId,
    diffs: []
  };
  store.saveEdit(edit1);
  store.saveEdit(edit2);
  const edits = store.getEdits(docId, clientId);
  t.equals(edits.length, 2);
  t.end();
});

test('[in-memory-store] removeEdit', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const edit = {
    id: docId,
    clientId: clientId,
    diffs: []
  };
  store.saveEdit(edit);
  const edits = store.getEdits(docId, clientId);
  store.removeEdit(edits[0]);
  t.end();
});

function doc (id, content, clientId, serverVersion, clientVersion) {
  return {
    id: id,
    clientId: clientId || 'dummyId',
    serverVersion: serverVersion || 'serverVersion',
    clientVersion: clientVersion || 'clientVersion',
    content: content
  };
}

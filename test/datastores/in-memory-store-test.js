'use strict';

var test = require('tape');
var InMemoryStore = require('../../lib/datastores/in-memory-store.js');

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

  const readDoc = store.getDocument(document.id)[0];
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

  const readDoc = store.getDocument(document.id)[0];
  t.equals(readDoc.id, document.id);
  t.equals(readDoc.content, document.content);

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

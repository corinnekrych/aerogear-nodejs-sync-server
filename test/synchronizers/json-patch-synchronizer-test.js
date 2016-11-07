'use strict';
var test = require('tape');
var jsonpatch = require('fast-json-patch');
var JSONPatchSynchronizer = require('../../lib/synchronizers/json-patch');

test('[json-patch synchronizer] create new JSONPatchSynchronizer', function (t) {
  t.ok(JSONPatchSynchronizer() instanceof JSONPatchSynchronizer,
       'JSONPatchSynchronizer should usable as a constructor');
  t.end();
});

test('[json-patch synchronizer] clientDiff', function (t) {
  const documentId = '1234';
  const clientId = 'client1';
  var synchronizer = JSONPatchSynchronizer();
  var diff;

  const source = {
    documentId: documentId,
    clientId: clientId,
    content: {
      name: 'fletch'
    }
  };

  const shadow = {
    documentId: documentId,
    clientId: clientId,
    content: {
      name: 'Fletch'
    }
  };

  source.content = {name: 'fletch'};
  diff = synchronizer.clientDiff(source, shadow).diff;
  t.ok(jsonpatch.apply(source.content, diff));
  t.equal(source.content.name, 'Fletch', 'source.content was unchanged');

  t.end();
});

test('[json-patch synchronizer] serverDiff', function (t) {
  const documentId = '1234';
  const clientId = 'client1';
  var synchronizer = JSONPatchSynchronizer();
  var diff;

  const source = {
    documentId: documentId,
    clientId: clientId,
    content: {
      name: 'fletch'
    }
  };

  const shadow = {
    documentId: documentId,
    clientId: clientId,
    content: {
      name: 'Fletch'
    }
  };

  source.content = {name: 'fletch'};
  diff = synchronizer.serverDiff(source, shadow).diff;
  t.ok(jsonpatch.apply(source.content, diff));
  t.equal(source.content.name, 'Fletch', 'source.content was unchanged');

  t.end();
});

test('[json-patch synchronizer] createPatchMessage', function (t) {
  const documentId = '1234';
  const clientId = 'client1';
  var synchronizer = JSONPatchSynchronizer();
  var diff;

  const source = {
    documentId: documentId,
    clientId: clientId,
    content: {
      name: 'fletch'
    }
  };

  const shadow = {
    documentId: documentId,
    clientId: clientId,
    content: {
      name: 'Fletch'
    }
  };

  diff = synchronizer.serverDiff(source, shadow);
  let patchMessage = synchronizer.createPatchMessage(documentId, clientId, [diff]);
  t.equal(patchMessage.documentId, documentId, 'documentIds should match');
  t.equal(patchMessage.clientId, clientId, 'clientIds should match');
  t.equal(patchMessage.edits.length, 1, 'the patchMessage should have one edit');
  t.equal(patchMessage.edits[0].diff, diff.diff, 'the patchMessage\'s diff should be equal the original diff');
  t.equal(JSON.stringify(patchMessage.edits[0].diff), JSON.stringify(diff.diff), 'the diff should be equal the original');

  t.end();
});

test('[json-patch synchronizer] patchDocument', function (t) {
  const documentId = '1234';
  const clientId = 'client1';
  var synchronizer = JSONPatchSynchronizer();
  var diff;

  const source = {
    documentId: documentId,
    clientId: clientId,
    content: {
      name: 'fletch'
    }
  };

  const shadow = {
    documentId: documentId,
    clientId: clientId,
    content: {
      name: 'Fletch'
    }
  };

  diff = synchronizer.serverDiff(source, shadow);
  let patchDocument = synchronizer.patchDocument(diff, source);
  t.equal(patchDocument.content.name, 'Fletch', 'patched document content should be equal original');

  t.end();
});

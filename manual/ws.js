'use strict';

//  const SyncEngine = require('../../lib/sync-engine.js');
//  const InMemoryDataStore = require('../../lib/datastores/in-memory-store.js');
//  const DiffMatchPatchSynchronizer = require('../../lib/synchronizers/diff-match-patch.js');
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:7777/sync');

//  const syncEngine = new SyncEngine(new DiffMatchPatchSynchronizer(),
                                  //  new InMemoryDataStore());
ws.on('open', function open () {
  const payload = {
    id: '1234',
    clientId: '5678',
    msgType: 'subscribe',
    content: 1
  };
  ws.send(JSON.stringify(payload));
});

ws.on('message', function (data, flags) {
  console.log(data);
  var json;
  try {
    json = JSON.parse(data);
  } catch (e) {
    this.emit('error', e);
    return;
  }

  switch (json.msgType) {
    case 'patch':
      console.log('Received patchMessage...', json);

      let update = {
        id: json.id,
        clientId: json.clientId,
        msgType: 'patch',
        content: 2
      };
      console.log('send patch', JSON.stringify(update));
      ws.send(JSON.stringify(update));
      break;
    case 'error':
      console.log('Error', json.content);
      break;
  }
});

/**
* @module sync
*/
'use strict';

const WebSocketServer = require('ws').Server;
const express = require('express');
const app = express();
const SyncHandler = require('./lib/sync-handler.js');
const SyncEngine = require('./lib/sync-engine.js');
const InMemoryDataStore = require('./lib/datastores/in-memory-store.js');
const DiffMatchPatchSynchronizer = require('./lib/synchronizers/diff-match-patch.js');

app.use(express.static('public'));

const server = app.listen(7777, '0.0.0.0', function () {
  console.log('Server UP at ' + server.address().port);
});

const wss = new WebSocketServer({server: server, path: '/sync'});
const syncEngine = new SyncEngine(new DiffMatchPatchSynchronizer(),
                                  new InMemoryDataStore());
const syncHandler = new SyncHandler(syncEngine);

wss.on('connection', function (socket) {
  console.log('Client Connected');

  socket.on('message', syncHandler.messageReceived);

  socket.on('close', function () {
    console.log('Closing client connection');
  });
});

wss.on('error', function (error) {
  console.log('WS Server error', error);
});

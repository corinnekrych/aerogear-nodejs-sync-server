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

const server = app.listen(7777, 'localhost', function () {
  console.log('Server listening at ' + server.address().port);
});

const ws = new WebSocketServer({server: server, path: '/sync'});
const syncEngine = new SyncEngine(new DiffMatchPatchSynchronizer(),
                                  new InMemoryDataStore());
const syncHandler = new SyncHandler(syncEngine);
syncHandler.messageReceived.bind(syncHandler);
syncHandler.clientClosed.bind(syncHandler);

syncHandler.on('subscriberAdded', function (patchMessage, subscriber) {
  console.log('subscriber added.');
  // store the subscriber with the current socket
  subscriber.client.subscriber = subscriber;
  subscriber.client.send(patchMessage);
});

syncHandler.on('patched', function (patchMessage, subscribers) {
  console.log('patch: notify all active subscribers');
  subscribers.forEach(function (subscriber) {
    subscriber.client.send(patchMessage);
  });
});

syncHandler.on('detached', function (message, client) {
  console.log('detached: close websocket');
  client.close();
});

syncHandler.on('error', function (errorMsg, client) {
  console.log('error: ', errorMsg);
  client.send(errorMsg);
});

ws.on('connection', function (socket) {
  console.log('Client Connected');

  socket.on('message', function (message) {
    syncHandler.messageReceived(message, socket);
  });

  socket.on('close', function () {
    console.log('Closing client connection');
    syncHandler.clientClosed(socket.subscriber);
  });
});

ws.on('error', function (error) {
  console.log('WS Server error', error);
});


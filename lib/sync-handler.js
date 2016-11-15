'use strict';

const EventEmitter = require('events').EventEmitter;
const util = require('util');

var SyncHandler = function (syncEngine) {
  if (!(this instanceof SyncHandler)) {
    return new SyncHandler(syncEngine);
  }
  this.syncEngine = syncEngine;
  this.subscribers = new Subscribers(this);
  EventEmitter.call(this);
};

util.inherits(SyncHandler, EventEmitter);

// TODO: This is only going to be used as a initial
// version for testing and the data structures will be updated
// to more efficient ones.
function Subscribers (emitter) {
  this.emitter = emitter;
  this.forDocument = forDocument;
  this.addSubscriber = addSubscriber;
  this.removeSubscriber = removeSubscriber;
  this.subscribers = {};
}

function forDocument (docId) {
  return this.subscribers[docId];
}

function addSubscriber (docId, clientId, client) {
  let subscriber = new Subscriber(docId, clientId, client);
  if (this.subscribers[docId]) {
    this.subscribers[docId].push(subscriber);
  } else {
    this.subscribers[docId] = new Array(subscriber);
  }
  return subscriber;
}

function removeSubscriber (subscriber) {
  const that = this;
  if (this.subscribers[subscriber.docId]) {
    this.subscribers[subscriber.docId].forEach(function (value, index, object) {
      if (subscriber.clientId === value.clientId) {
        console.log('delete subscriber: ', value.clientId);
        object.splice(index, 1);
        that.emitter.emit('subscriberDeleted', value);
      }
    });
  }
}

function Subscriber (docId, clientId, client) {
  this.docId = docId;
  this.clientId = clientId;
  this.client = client;
}

SyncHandler.prototype.messageReceived = function (data, client) {
  var json;
  try {
    json = JSON.parse(data);
  } catch (e) {
    this.emit('error', e);
    return;
  }

  const docId = json.id;
  const clientId = json.clientId;

  switch (json.msgType) {
    case 'subscribe':
      let patchMessage = this.syncEngine.addDocument(json, clientId);
      let subscriber = this.subscribers.addSubscriber(docId, clientId, client);
      this.emit('subscriberAdded', JSON.stringify(patchMessage), subscriber);
      break;
    case 'patch':
      // TODO: implement this call but first add the code in SyncEngine
      //  this.syncEngine.patch(json);
      var subs = this.subscribers.forDocument(docId);
      this.emit('patched', JSON.stringify({msg: 'patch not implemented yet'}), subs);
      break;
    case 'detach':
      this.subscribers.removeSubscriber(client.subscriber);
      this.emit('detached', client.subscriber);
      break;
    default:
      const errorMsg = {
        id: json.id,
        client: json.clientid,
        msgType: 'error',
        content: 'Unknown msgType: ' + json.msgType
      };
      this.emit('error', JSON.stringify(errorMsg), client);
  }
};

SyncHandler.prototype.clientClosed = function (subscriber) {
  this.subscribers.removeSubscriber(subscriber);
};

module.exports = SyncHandler;

'use strict';

const EventEmitter = require('events').EventEmitter;
const util = require('util');

var SyncHandler = function (syncEngine) {
  if (!(this instanceof SyncHandler)) {
    return new SyncHandler(syncEngine);
  }
  this.syncEngine = syncEngine;
  EventEmitter.call(this);
};

util.inherits(SyncHandler, EventEmitter);

SyncHandler.prototype.messageReceived = function (data, flags) {
  var parsedData, patchMessage;

  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    this.emit('error', e);
    return;
  }

  switch (parsedData.msgType) {
    case 'add':
      // Something Something Subscribers?

      // Add the document
      patchMessage = this.syncEngine.addDocument(parsedData, parsedData.clientId);
      break;
    case 'patch':
      break;
    case 'detach':
      break;
    default:
      patchMessage = 'Unknown msgType ' + parsedData.msgType;
      break;
  }

  this.emit('send', patchMessage);
};

module.exports = SyncHandler;

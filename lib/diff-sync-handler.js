var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    diffSyncEngine = require('./server/sync-engine')();

var DiffSyncHandler = function (settings) {

    if (!(this instanceof DiffSyncHandler)) {
        return new DiffSyncHandler(settings);
    }

    EventEmitter.call(this);
};

util.inherits(DiffSyncHandler, EventEmitter);

DiffSyncHandler.prototype.messageReceived = function (data, flags) {
    var parsedData, doc, clientId, patchMessage;

    try {
        parsedData = JSON.parse(data);
    } catch (e) {
        // Return Error?
        parsedData = {};
    }

    switch (parsedData.msgType) {
    case 'add':
        // Something Something Subscribers?

        //Add the document
        patchMessage = diffSyncEngine.addDocument(parsedData);
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

module.exports = DiffSyncHandler;

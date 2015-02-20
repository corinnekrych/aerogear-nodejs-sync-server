var WebSocketServer = require('ws').Server,
    express = require('express'),
    app = express();
var DiffSyncHandler = require('./lib/diff-sync-handler');

app.use(express.static('public'));


var server = app.listen(7777, '0.0.0.0', function () {
    console.log('Server UP at ' + server.address().port);
});

var wss = new WebSocketServer({server: server, path: "/sync"});
var diffSyncHandler = new DiffSyncHandler();

wss.on('connection', function (socket) {
    console.log('Client Connected');

    socket.on('message', diffSyncHandler.messageReceived);

    socket.on('close', function () {
        console.log('Closing client connection');
    });
});

wss.on('error', function (error) {
    console.log('WS Server error', error);
});

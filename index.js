var WebSocketServer = require('ws').Server,
    express = require('express'),
    app = express();

app.use(express.static('public'));


var server = app.listen(1138, function () {
    console.log('Server UP at ' + server.address().port);
});

var wss = new WebSocketServer({server: server});
var diffSyncHandler = require('./server/diff-sync-handler');



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

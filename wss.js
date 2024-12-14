const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

const clients = new Set();

wss.on('connection', function connection(ws) {
    clients.add(ws);

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on('close', function () {
        clients.delete(ws);
    });
});
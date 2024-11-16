const WebSocket = require('ws');
const { handleExampleMessage } = require('./handlers/exampleHandler');

const setupWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');

        ws.on('message', (data) => {
            const message = JSON.parse(data);
            console.log('Received message:', message);

            // Dispatch message based on type
            switch (message.type) {
                case 'example':
                    handleExampleMessage(message.payload, ws);
                    break;
                default:
                    ws.send(JSON.stringify({ error: 'Unknown message type' }));
            }
        });
    });

    return wss;
};

module.exports = setupWebSocket;

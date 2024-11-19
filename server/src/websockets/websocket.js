import { WebSocketServer } from 'ws';

export function setupWebSocket(server) {
    // Create a WebSocket server attached to the provided HTTP server
    const wss = new WebSocketServer({ server });

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
}

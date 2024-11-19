import { WebSocketServer } from 'ws';
import messageService from '../services/messageService.js';

export function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');

        // Add the new client to the MessageService client list
        messageService.addClient(ws);

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

        ws.on('close', () => {
            // Remove the client from the MessageService client list on disconnect
            messageService.removeClient(ws);
            console.log('WebSocket connection closed');
        });
    });

    return wss;
}

export function handleExampleMessage(message, ws) {
  console.log('Handling example message:', message);

  // Example response logic
  const response = { type: 'example', payload: 'This is an example response' };
  ws.send(JSON.stringify(response));
};

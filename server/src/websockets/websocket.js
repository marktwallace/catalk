import { WebSocketServer } from 'ws';
import { verifyJWT } from '../utils/jwt.js';
import { handleExampleMessage } from './handlers/exampleHandler.js';
import messageService from '../services/messageService.js';

export function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        // Extract the authorization header from the request
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            ws.close(4001, 'No authorization header provided');
            return;
        }

        const token = authHeader.split(' ')[1]; // expecting 'Bearer sessionToken'

        if (!token) {
            ws.close(4002, 'Invalid authorization header format');
            return;
        }

        try {
            // Verify the JWT
            const payload = verifyJWT(token);
            if (!payload) {
                ws.close(4003, 'Invalid or expired session token');
                return;
            }

            // Attach the publicKey to the WebSocket object for use in message handlers
            ws.publicKey = payload.sub;

            console.log('New authenticated WebSocket connection');
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
                console.log('WebSocket connection closed');
            });

        } catch (error) {
            console.error('JWT verification error:', error.message);
            ws.close(4001, 'Invalid or expired session token');
        }
    });

    return wss;
}

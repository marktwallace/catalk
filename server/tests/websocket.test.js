const WebSocket = require('ws');
const http = require('http');
const setupWebSocket = require('../src/websockets/websocket');

let server, ws;

beforeAll((done) => {
    server = http.createServer();
    setupWebSocket(server);
    server.listen(3001, done);
});

afterAll((done) => {
    server.close(done);
});

test('WebSocket connection and message handling', (done) => {
    ws = new WebSocket('ws://localhost:3001');

    ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'example', payload: 'Test message' }));
    });

    ws.on('message', (message) => {
        const response = JSON.parse(message);
        expect(response.type).toBe('example');
        expect(response.payload).toBe('This is an example response');
        ws.close();
        done();
    });
});

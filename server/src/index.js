require('dotenv').config();
const http = require('http');
const app = require('./app');
const setupWebSocket = require('./websockets/websocket');

const { PORT = 3000 } = process.env;

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server
setupWebSocket(server);

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

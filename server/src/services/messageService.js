import { signMessage } from '../utils/sign.js';

class MessageService {
  constructor() {
    this.clients = new Set(); // Use a Set to easily add/remove connected clients
  }

  addClient(client) {
    this.clients.add(client);
  }

  removeClient(client) {
    this.clients.delete(client);
  }

  broadcastMessage(message, serverPrivateKeyUint8) {
    // Sign the message
    const signedMessage = signMessage(message, serverPrivateKeyUint8);

    console.log('Broadcasting message:', signedMessage);
    // Broadcast the signed message to all connected clients
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(signedMessage));
        console.log('Sent message to client');
      }
    });
  }
}

const messageService = new MessageService();

export default messageService;

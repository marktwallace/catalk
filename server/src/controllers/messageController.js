// src/controllers/messageController.js
import messageService from '../services/messageService.js';

export function postReply(req, res) {
  console.log('Received body:', req.body);
  const message = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  console.log('Received message:', message);
  message.publicKey = req.publicKey;
  messageService.broadcastMessage(message);
  res.status(200).json({ status: 'OK' });
}

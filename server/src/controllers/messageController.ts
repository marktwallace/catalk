// src/controllers/messageController.ts
import { Request, Response } from 'express';
import messageService from '../services/messageService.js';

export function postReply(req: Request, res: Response): void {
  console.log('Received body:', req.body);
  const message = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  console.log('Received message:', message);
  message.publicKey = req.publicKey;

  messageService.broadcastMessage(message);
  res.status(200).json({ status: 'OK' });
}

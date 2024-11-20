import express from 'express';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { createInvite, acceptInvite } from './controllers/inviteController.js';
import { login, confirmLogin } from './controllers/authController.js';

const router = express.Router();

// Unprotected routes
router.post('/create-invite', createInvite);
router.post('/accept-invite', acceptInvite);
router.post('/login', login);
router.post('/confirm-login', confirmLogin);

// Protected routes
router.get('/protected', authMiddleware, (req,res) => {
    res.json({message: 'Protected resource', publicKey: req.publicKey});
});

export default router;

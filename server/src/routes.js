import express from 'express';
import { createInvite, acceptInvite } from './controllers/inviteController.js';
import { login, confirmLogin } from './controllers/authController.js';

const router = express.Router();

router.post('/create-invite', createInvite);
router.post('/accept-invite', acceptInvite);
router.post('/login', login);
router.post('/confirm-login', confirmLogin);

export default router;

// middlewares/authMiddleware.js
import { verifyJWT } from '../utils/jwt.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1]; // expecting 'Bearer sessionToken'

  if (!token) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  try {
    const payload = verifyJWT(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    // Attach the publicKey to the request object for use in handlers
    req.publicKey = payload.sub;

    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
};

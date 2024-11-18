// middlewares/authMiddleware.js
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

const { verifyJWT } = require('../utils/jwt');

// Load server's public key
const SERVER_PUBLIC_KEY_BASE64 = process.env.SERVER_PUBLIC_KEY_BASE64;
const serverPublicKeyUint8 = nacl.util.decodeBase64(SERVER_PUBLIC_KEY_BASE64);

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1]; // expecting 'Bearer sessionToken'

  if (!token) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  try {
    const payload = verifyJWT(token, serverPublicKeyUint8);

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

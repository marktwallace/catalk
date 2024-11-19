// src/controllers/authController.js
import nacl from 'tweetnacl';
import { createJWT } from '../utils/jwt.js';
import messageService from '../services/messageService.js';

const PRIVATE_KEY_BASE64 = process.env.CATALK_PRIVATE_KEY;
const PUBLIC_KEY_BASE64 = process.env.CATALK_PUBLIC_KEY;
const serverPrivateKeyUint8 = Uint8Array.from(Buffer.from(PRIVATE_KEY_BASE64, 'base64'));
const serverPublicKeyUint8 = Uint8Array.from(Buffer.from(PUBLIC_KEY_BASE64, 'base64'));
console.log('Decoded private key length:', serverPrivateKeyUint8.length); // Should be 64
console.log('Decoded public key length:', serverPublicKeyUint8.length); // Should be 32

// In-memory storage with expiration (for nonces)
const nonces = new Map(); // key: publicKeyBase64, value: { nonceBase64, expiresAt }
const NONCE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * POST /api/login
 * Client sends its public key to initiate login
 */
/* TEST WITH: (includes an unused public key)
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"publicKey": "aLDNkzRVAj9o5dQ5cmfqeMGvJ2av33/rc111LKm5heo="}'
*/
export function login(req, res) {
  const { publicKey } = req.body;

  if (!publicKey) {
    return res.status(400).json({ error: 'Public key is required' });
  }

  try {
    // Decode the public key from base64 to Uint8Array
    const publicKeyUint8 = Uint8Array.from(Buffer.from(publicKey, 'base64'));

    if (publicKeyUint8.length !== nacl.sign.publicKeyLength) {
      return res.status(400).json({ error: 'Invalid public key length' });
    }

    // Generate a nonce
    const nonce = nacl.randomBytes(24); // 24 bytes is arbitrary
    const nonceBase64 = Buffer.from(nonce).toString('base64');

    // Set expiration time for the nonce
    const expiresAt = Date.now() + NONCE_EXPIRATION_TIME;

    // Store the nonce associated with the public key
    nonces.set(publicKey, { nonceBase64, expiresAt });

    // Return the nonce to the client
    res.status(200).json({ nonce: nonceBase64 });
  } catch (error) {
    console.error('Error in login:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/confirm-login
 * Client sends the signature of the nonce to confirm login
 */
export function confirmLogin(req, res) {
  const { publicKey, signature } = req.body;

  if (!publicKey || !signature) {
    return res.status(400).json({ error: 'Public key and signature are required' });
  }

  try {
    // Get the stored nonce for this public key
    const nonceData = nonces.get(publicKey);

    if (!nonceData) {
      return res.status(400).json({ error: 'No login initiated for this public key' });
    }

    const { nonceBase64, expiresAt } = nonceData;

    // Check if the nonce has expired
    if (Date.now() > expiresAt) {
      nonces.delete(publicKey);
      return res.status(400).json({ error: 'Nonce has expired' });
    }

    // Decode the public key, signature, and nonce from base64
    const publicKeyUint8 = Uint8Array.from(Buffer.from(publicKey, 'base64'));
    const signatureUint8 = Uint8Array.from(Buffer.from(signature, 'base64'));
    const nonceUint8 = Uint8Array.from(Buffer.from(nonceBase64, 'base64'));

    // Verify the signature of the nonce
    const isValid = nacl.sign.detached.verify(nonceUint8, signatureUint8, publicKeyUint8);

    if (!isValid) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Signature is valid, generate a JWT as session token
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // Expires in 1 hour

    const header = {
      alg: 'EdDSA',
      typ: 'JWT',
    };

    const payload = {
      sub: publicKey, // Subject is the client's public key
      exp: expirationTime,
      iat: Math.floor(Date.now() / 1000),
    };

    const jwt = createJWT(header, payload, serverPrivateKeyUint8);

    // Delete the nonce as it's no longer needed
    nonces.delete(publicKey);

    // Announce the user login over the WebSocket using the MessageService
    const announcement = {
      type: 'user_login',
      publicKey,
      friendlyName: 'UserFriendlyNameHere', // Replace with actual user's friendly name
      privilege: 'standard', // Replace with actual privilege level
      timestamp: Date.now(),
    };

    messageService.broadcastMessage(announcement, serverPrivateKeyUint8);

    // Return the JWT to the client
    res.status(200).json({ sessionToken: jwt });
  } catch (error) {
    console.error('Error in confirmLogin:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

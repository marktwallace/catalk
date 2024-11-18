// utils/jwt.js
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

// Helper functions for base64url encoding and decoding
function base64urlEncode(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str) {
  // Pad with '=' to make the length a multiple of 4
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64');
}

// Function to create a JWT
function createJWT(header, payload, privateKeyUint8) {
  const headerJSON = JSON.stringify(header);
  const payloadJSON = JSON.stringify(payload);

  const encodedHeader = base64urlEncode(headerJSON);
  const encodedPayload = base64urlEncode(payloadJSON);

  const message = encodedHeader + '.' + encodedPayload;

  const messageUint8 = new Uint8Array(Buffer.from(message));

  const signatureUint8 = nacl.sign.detached(messageUint8, privateKeyUint8);

  const encodedSignature = base64urlEncode(signatureUint8);

  const jwt = message + '.' + encodedSignature;

  return jwt;
}

// Function to verify a JWT
function verifyJWT(jwt, publicKeyUint8) {
  const parts = jwt.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const message = encodedHeader + '.' + encodedPayload;

  const messageUint8 = new Uint8Array(Buffer.from(message));

  const signatureUint8 = new Uint8Array(base64urlDecode(encodedSignature));

  const isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);

  if (!isValid) {
    return null;
  }

  // Parse the payload and check expiration
  const payloadJSON = Buffer.from(base64urlDecode(encodedPayload)).toString('utf8');
  const payload = JSON.parse(payloadJSON);

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null; // Token has expired
  }

  return payload; // Return the payload if valid
}

// Export the functions
module.exports = {
  base64urlEncode,
  base64urlDecode,
  createJWT,
  verifyJWT,
};
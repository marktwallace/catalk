// utils/jwt.test.js
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
const { createJWT, verifyJWT } = require('../../src/utils/jwt');

test('JWT creation and verification', () => {
  // Generate server key pair
  const serverKeyPair = nacl.sign.keyPair();
  const serverPrivateKeyUint8 = serverKeyPair.secretKey;
  const serverPublicKeyUint8 = serverKeyPair.publicKey;

  // Create a JWT
  const header = {
    alg: 'EdDSA',
    typ: 'JWT',
  };

  const payload = {
    sub: 'test_subject',
    exp: Math.floor(Date.now() / 1000) + 60, // Expires in 60 seconds
    iat: Math.floor(Date.now() / 1000),
  };

  const jwt = createJWT(header, payload, serverPrivateKeyUint8);

  // Verify the JWT
  const verifiedPayload = verifyJWT(jwt, serverPublicKeyUint8);

  expect(verifiedPayload).not.toBeNull();
  expect(verifiedPayload.sub).toBe('test_subject');
});

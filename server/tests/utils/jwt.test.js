// utils/jwt.test.js
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
const { createJWT, verifyJWT } = require('../../src/utils/jwt');
const { jwtVerify } = require('jose');

test('JWT creation and verification', () => {
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

  const jwt = createJWT(header, payload);

  // Verify the JWT
  const verifiedPayload = verifyJWT(jwtVerify);

  expect(verifiedPayload).not.toBeNull();
  expect(verifiedPayload.sub).toBe('test_subject');
});

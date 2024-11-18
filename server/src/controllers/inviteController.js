// src/controllers/inviteController.js
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

const PRIVATE_KEY_BASE64 = process.env.CATALK_PRIVATE_KEY;
const PUBLIC_KEY_BASE64 = process.env.CATALK_PUBLIC_KEY;

/* TEST WITH:
curl -X POST http://localhost:3000/api/create-invite \
  -H "Authorization: $CATALK_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"privileges": "read-write"}'
*/
exports.createInvite = (req, res) => {
  const ownerToken = req.headers['authorization'];

  if (ownerToken !== process.env.CATALK_OWNER_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { privileges } = req.body;

  if (!privileges || typeof privileges !== 'string') {
    return res.status(400).json({ error: 'Invalid privileges provided' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const inviteString = `${privileges}|${timestamp}`;
  const inviteBuffer = nacl.util.decodeUTF8(inviteString);

  try {
    // Convert the private key seed from base64 to a Uint8Array
    const privateKeySeed = nacl.util.decodeBase64(PRIVATE_KEY_BASE64);

    // Generate the key pair from the private key seed
    const keyPair = nacl.sign.keyPair.fromSeed(privateKeySeed);

    // Use the 64-byte secret key for signing
    const secretKey = keyPair.secretKey;

    // Sign the invite using Ed25519
    const signature = nacl.sign.detached(inviteBuffer, secretKey);
    const signatureBase64 = nacl.util.encodeBase64(signature);

    const inviteToken = `${nacl.util.encodeBase64(inviteBuffer)}.${signatureBase64}`;

    res.json({ invite: inviteToken });
  } catch (error) {
    console.error('Error signing invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* TEST WITH:
curl -X POST http://localhost:3000/api/accept-invite \
  -H "Content-Type: application/json" \
  -d '{"inviteToken": "your_invite_token_here", "publicKey": "your_public_key_here"}'
*/

exports.acceptInvite = (req, res) => {
  const { inviteToken } = req.body;

  if (!inviteToken) {
    return res.status(400).json({ error: 'Invite token is required' });
  }

  const [inviteDataBase64, providedSignatureBase64] = inviteToken.split('.');
  if (!inviteDataBase64 || !providedSignatureBase64) {
    return res.status(400).json({ error: 'Invalid invite token format' });
  }

  try {
    // Attempt to decode Base64 inputs
    const inviteData = nacl.util.decodeBase64(inviteDataBase64);
    const providedSignature = nacl.util.decodeBase64(providedSignatureBase64);
    const publicKeyUint8 = nacl.util.decodeBase64(PUBLIC_KEY_BASE64);

    // Verify the signature using the public key
    const isVerified = nacl.sign.detached.verify(inviteData, providedSignature, publicKeyUint8);

    if (!isVerified) {
      return res.status(403).json({ error: 'Invalid invite token signature' });
    }

    // Proceed with accepting the invite
    res.status(200).json({ message: 'Invite accepted successfully' });
  } catch (error) {
    if (error instanceof TypeError && error.message === 'invalid encoding') {
      // Handle invalid Base64 encoding
      console.warn('Invalid Base64 encoding in invite token');
      return res.status(400).json({ error: 'Invalid invite token format' });
    } else {
      // Log minimal error information for unexpected errors
      console.error('Unexpected error in acceptInvite:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// src/controllers/inviteController.js
import nacl from 'tweetnacl';

const PRIVATE_KEY_BASE64 = process.env.CATALK_PRIVATE_KEY;
const PUBLIC_KEY_BASE64 = process.env.CATALK_PUBLIC_KEY;
const serverPrivateKeyUint8 = Uint8Array.from(Buffer.from(PRIVATE_KEY_BASE64, 'base64'));
const serverPublicKeyUint8 = Uint8Array.from(Buffer.from(PUBLIC_KEY_BASE64, 'base64'));
console.log('Decoded private key length:', serverPrivateKeyUint8.length); // Should be 64
console.log('Decoded public key length:', serverPublicKeyUint8.length); // Should be 32

/* TEST WITH:
curl -X POST http://localhost:6765/api/create-invite \
  -H "Authorization: $CATALK_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"privileges": "read-write"}'
*/
export async function createInvite(req, res) {
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
  const inviteBuffer = new TextEncoder().encode(inviteString);

  try {
    // Use the 64-byte private key directly for signing
    const signature = nacl.sign.detached(inviteBuffer, serverPrivateKeyUint8);
    const signatureBase64 = Buffer.from(signature).toString('base64');

    const inviteToken = `${Buffer.from(inviteBuffer).toString('base64')}.${signatureBase64}`;

    res.json({ invite: inviteToken });
  } catch (error) {
    console.error('Error signing invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* TEST WITH:
curl -X POST http://localhost:6765/api/accept-invite \
  -H "Content-Type: application/json" \
  -d '{"inviteToken": "your_invite_token_here", "publicKey": "your_public_key_here"}'
*/

export async function acceptInvite(req, res) {
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
    const inviteData = Uint8Array.from(Buffer.from(inviteDataBase64, 'base64'));
    const providedSignature = Uint8Array.from(Buffer.from(providedSignatureBase64, 'base64'));

    // Verify the signature using the public key
    const isVerified = nacl.sign.detached.verify(inviteData, providedSignature, serverPublicKeyUint8);

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

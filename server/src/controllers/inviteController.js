// src/controllers/inviteController.js
const crypto = require('crypto');

const PRIVATE_KEY = process.env.CATALK_PRIVATE_KEY;

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

  // Make sure privileges exist and are valid
  if (!privileges || typeof privileges !== 'string') {
    return res.status(400).json({ error: 'Invalid privileges provided' });
  }

  // Generate invite data with a timestamp to prevent reuse
  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

  // Create a compact representation: privileges|timestamp
  const inviteString = `${privileges}|${timestamp}`;
  const inviteBuffer = Buffer.from(inviteString);

  try {
    // Convert the private key from PEM format to a KeyObject
    const privateKeyObj = crypto.createPrivateKey({
      key: PRIVATE_KEY,
      format: 'pem',
      type: 'pkcs8', // Explicitly set the key type to pkcs8 for Ed25519
    });

    // Sign the invite using Ed25519
    const signature = crypto.sign(
      null, // Ed25519 ignores the algorithm argument; you can set it as null.
      inviteBuffer,
      privateKeyObj
    ).toString('base64url'); // Use base64url to make it URL-friendly

    // Create a final invite token (invite data + signature)
    const inviteToken = `${inviteBuffer.toString('base64url')}.${signature}`;

    // Return the compact invite token
    res.json({ invite: inviteToken });
  } catch (error) {
    console.error('Error signing invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Accept invite function
/* TEST WITH:
curl -X POST http://localhost:3000/api/accept-invite \
  -H "Content-Type: application/json" \
  -d '{"inviteToken": "your_invite_token_here", "publicKey": "your_public_key_here"}'
*/
exports.acceptInvite = (req, res) => {
  const { inviteToken, publicKey } = req.body;

  if (!inviteToken || !publicKey) {
    return res.status(400).json({ error: 'Invite token and public key are required' });
  }

  // Split the invite token into its components (invite data and signature)
  const [inviteDataBase64, providedSignature] = inviteToken.split('.');
  if (!inviteDataBase64 || !providedSignature) {
    return res.status(400).json({ error: 'Invalid invite token format' });
  }

  // Decode invite data
  const inviteData = Buffer.from(inviteDataBase64, 'base64url').toString();

  try {
    // Regenerate the full signature
    const privateKeyObj = crypto.createPrivateKey({
      key: PRIVATE_KEY,
      format: 'pem',
      type: 'pkcs8',
    });

    const regeneratedSignature = crypto.sign(
      null,
      Buffer.from(inviteData),
      privateKeyObj
    ).toString('base64url');

    // Compare the full signature directly
    if (regeneratedSignature !== providedSignature) {
      return res.status(403).json({ error: 'Invalid invite token signature' });
    }

    // Store the public key for future authentication (this is a placeholder for demonstration)
    console.log('Accepted public key:', publicKey);

    res.status(200).json({ message: 'Invite accepted successfully' });
  } catch (error) {
    console.error('Error verifying invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

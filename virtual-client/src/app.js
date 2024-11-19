// client.js
import fetch from 'node-fetch';
import nacl from 'tweetnacl';

const SERVER_URL = 'http://localhost:6765';

(async () => {
  try {
    // Get invite token from command line arguments
    const inviteToken = process.argv[2];
    if (!inviteToken) {
      console.error('Error: Invite token is required as a command line parameter.');
      return;
    }

    console.log('Invite Token:', inviteToken);

    // Generate a key pair for the client
    const keyPair = nacl.sign.keyPair();
    const publicKeyUint8 = keyPair.publicKey;
    const privateKeyUint8 = keyPair.secretKey;

    const publicKeyBase64 = Buffer.from(publicKeyUint8).toString('base64');
    console.log('Generated Public Key:', publicKeyBase64);

    // Step 1: Accept invite
    console.log('Sending invite acceptance request...');
    const acceptInviteResponse = await fetch(`${SERVER_URL}/api/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteToken, publicKey: publicKeyBase64 }),
    });

    const acceptInviteData = await acceptInviteResponse.json();

    if (!acceptInviteResponse.ok) {
      console.error('Accept invite error:', acceptInviteData.error);
      return;
    }

    console.log('Invite accepted successfully. Proceeding to login...');

    // Step 2: Initiate login
    console.log('Sending login request...');
    const loginResponse = await fetch(`${SERVER_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: publicKeyBase64 }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error('Login error:', loginData.error);
      return;
    }

    const nonceBase64 = loginData.nonce;
    console.log('Received nonce from server:', nonceBase64);

    // Step 3: Confirm login
    const nonceUint8 = Buffer.from(nonceBase64, 'base64');

    // Sign the nonce with the private key
    console.log('Signing nonce...');
    const signatureUint8 = nacl.sign.detached(nonceUint8, privateKeyUint8);
    const signatureBase64 = Buffer.from(signatureUint8).toString('base64');

    console.log('Sending confirm login request...');
    const confirmResponse = await fetch(`${SERVER_URL}/api/confirm-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: publicKeyBase64,
        signature: signatureBase64,
      }),
    });

    const confirmData = await confirmResponse.json();

    if (!confirmResponse.ok) {
      console.error('Confirm login error:', confirmData.error);
      return;
    }

    const sessionToken = confirmData.sessionToken;
    console.log('Login confirmed. Session Token:', sessionToken);

    // Step 4: Access protected route
    console.log('Sending request to protected route...');
    const protectedResponse = await fetch(`${SERVER_URL}/api/protected`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
    });

    const protectedData = await protectedResponse.json();

    if (!protectedResponse.ok) {
      console.error('Protected route error:', protectedData.error);
      return;
    }

    console.log('Protected Data:', protectedData);
  } catch (error) {
    console.error('Error:', error);
  }
})();
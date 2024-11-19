import nacl from 'tweetnacl';

function signMessage(message, serverPrivateKeyUint8) {
  const messageString = JSON.stringify(message);
  const messageUint8 = new TextEncoder().encode(messageString);
  const signatureUint8 = nacl.sign.detached(messageUint8, serverPrivateKeyUint8);
  const signatureBase64 = Buffer.from(signatureUint8).toString('base64');
  return {
    message,
    signature: signatureBase64,
  };
}

export { signMessage };

#!/bin/bash
KEY_DIR="$HOME/.catalk"
PRIVATE_KEY_PATH="$KEY_DIR/private_key.pem"
PUBLIC_KEY_PATH="$KEY_DIR/public_key.pem"
OWNER_TOKEN_PATH="$KEY_DIR/owner_token.txt"

# Create the directory if it doesn't exist
mkdir -p "$KEY_DIR"
chmod 700 "$KEY_DIR"

# Check if key pair exists
if [ ! -f "$PRIVATE_KEY_PATH" ]; then
  # Generate key pair
  openssl genpkey -algorithm Ed25519 -out "$PRIVATE_KEY_PATH"
  openssl pkey -in "$PRIVATE_KEY_PATH" -pubout -out "$PUBLIC_KEY_PATH"
fi

# Set private key as a secret
#flyctl secrets set CATALK_PRIVATE_KEY="$(cat "$PRIVATE_KEY_PATH")"
# Include public key for convenience
#flyctl secrets set CATALK_PUBLIC_KEY="$(cat "$PUBLIC_KEY_PATH")"

# Output public key
echo "Public Key:"
cat "$PUBLIC_KEY_PATH"

# Check for existing token
if [ ! -f "$OWNER_TOKEN_PATH" ]; then
  # Create owner bearer token
  head -c 30 /dev/urandom | base64 > "$OWNER_TOKEN_PATH"
fi

# Set private key as a secret
#flyctl secrets set CATALK_OWNER_TOKEN="$(cat "$OWNER_TOKEN_PATH")"

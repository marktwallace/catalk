#!/bin/bash
KEY_DIR="$HOME/.catalk"
PRIVATE_KEY_PATH="$KEY_DIR/private_key_base64.txt"
PUBLIC_KEY_PATH="$KEY_DIR/public_key_base64.txt"
OWNER_TOKEN_PATH="$KEY_DIR/owner_token.txt"

# Set private key as a secret
flyctl secrets set CATALK_PRIVATE_KEY="$(cat "$PRIVATE_KEY_PATH")"
# Include public key for convenience
flyctl secrets set CATALK_PUBLIC_KEY="$(cat "$PUBLIC_KEY_PATH")"
# Set owner token as a secret
flyctl secrets set CATALK_OWNER_TOKEN="$(cat "$OWNER_TOKEN_PATH")"

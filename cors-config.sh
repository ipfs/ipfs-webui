#!/bin/bash

ALLOW_ORIGINS='"http://localhost:5001", "https://webui.ipfs.io", "https://dev.webui.ipfs.io"'

# stop executing if anything fails
set -e

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[$ALLOW_ORIGINS]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'

echo "Kubo RPC CORS headers configured for $ALLOW_ORIGINS"
echo "Please restart your IPFS daemon"

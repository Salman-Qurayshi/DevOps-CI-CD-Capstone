#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status

APP_DIR=$(dirname "$0") # Get the directory where the script is located
cd "$APP_DIR" 

echo "--- Stopping existing containers (if any) ---"
docker-compose down || true 

echo "--- Building Docker images for deployment ---"
docker-compose build

echo "--- Starting containers with Docker Compose ---"
docker-compose up -d

echo "--- Deployment complete! ---"
echo "Node.js app should be running on port 3000 (internal to Docker Compose network)."
echo "Nginx should be forwarding requests from port 80 to the Node.js app."
echo "You can access the application via your server's IP address on port 80."
#!/bin/bash


# Install dependencies
npm install

# Build the React app
npm run build

# Copy the built files to the current server folder
cp -r build/*  ./server/client

# Clean up (optional)
rm -rf build

# Install the server dependencies

cd server

npm install

#Exit the script
exit 0

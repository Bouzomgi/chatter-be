#!/bin/bash

# Define the path for the PID file
PID_FILE="/home/ec2-user/nodeapp.pid"

# Change to the directory where the application is located
cd /home/ec2-user/my-app || {
  echo "Failed to change directory to /home/ec2-user/my-app"
  exit 1
}

npm install --only=production

# Run the Node.js app in the background
nohup node dist/src/index.js > /dev/null 2>&1 &

# Capture the process ID (PID) and store it in a file for later use
if echo $! > "$PID_FILE"; then
  echo "Node.js server started with PID $(cat $PID_FILE)"
else
  echo "Failed to capture PID for the Node.js server."
  exit 1
fi

# Disown the process so it's not attached to the terminal
disown


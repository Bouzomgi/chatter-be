#!/bin/bash

# Change to the directory where the application is located
cd /home/ec2-user/my-app

# Run the Node.js app in the background
nohup node dist/src/index.js &

# Capture the process ID (PID) and store it in a file for later use
echo $! > /home/ec2-user/nodeapp.pid

# Disown the process so it's not attached to the terminal
disown

echo "Node.js server started in the background with PID $(cat /home/ec2-user/nodeapp.pid)"

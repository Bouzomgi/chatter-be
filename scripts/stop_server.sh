#!/bin/bash

# Define the file where the process ID (PID) is stored
PIDFILE="/home/ec2-user/nodeapp.pid"

# Check if the PID file exists
if [ -f "$PIDFILE" ]; then
    # Read the PID from the file
    PID=$(cat "$PIDFILE")

    # Check if the process is running
    if ps -p $PID > /dev/null; then
        # Stop the Node.js process
        kill -9 $PID
        echo "Node.js server (PID: $PID) stopped."
    else
        echo "Process with PID $PID is not running."
    fi

    # Remove the PID file
    rm -f "$PIDFILE"
else
    echo "PID file does not exist. Node.js server may not be running."
fi

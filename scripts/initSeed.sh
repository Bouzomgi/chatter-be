#!/bin/bash

# Check if the .initialized file exists
if [ -f /app/.initialized ]; then
  echo "Initialization has already been completed. Skipping..."
else
  echo "First time setup, initializing..."
  npm run reset-and-seed

  # Create a flag file to indicate initialization has been done
  touch /app/.initialized
fi

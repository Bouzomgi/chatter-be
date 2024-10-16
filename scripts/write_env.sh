#!/bin/bash

# Pull all current environment variables and store them in /etc/environment
env | while read -r line; do
  echo "export $line" >> /etc/environment
done

# Source the /etc/environment file to load variables for current session
source /etc/environment
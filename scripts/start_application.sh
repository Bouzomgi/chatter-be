#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user

source /home/ec2-user/.env

npm install --only=production

node dist/src/index.js
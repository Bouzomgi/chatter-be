#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user

npm install --only=production

node dist/src/index.js
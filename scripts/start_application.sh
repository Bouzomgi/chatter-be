#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user/my-app

npm install --only=production

node dist/src/index.js
#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user

# Unzip the application package
unzip my-app

cd my-app

npm install --only=production
source /etc/environment
node dist/src/index.js


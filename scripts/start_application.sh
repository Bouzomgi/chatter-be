#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user/my-app

npm install --only=production

ls
node dist/src/index.js
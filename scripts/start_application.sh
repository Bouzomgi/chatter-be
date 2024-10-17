#!/bin/bash

cd /home/ec2-user

source /home/ec2-user/.env

npm install --only=production

npx prisma generate

node dist/src/index.js &
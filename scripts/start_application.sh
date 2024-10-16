#!/bin/bash

cd /home/ec2-user/my-app
npm run build
node dist/src/index.js


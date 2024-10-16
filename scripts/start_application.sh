#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user

# Unzip the application package
unzip my-app.zip

# Remove the zip file if you no longer need it
rm my-app.zip

cd my-app

node dist/src/index.js


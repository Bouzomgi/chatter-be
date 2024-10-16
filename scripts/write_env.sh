#!/bin/bash

# Create a file to hold environment variables
ENV_FILE="/home/ec2-user/my-app/.env"

# Create the directory if it doesn't exist
mkdir -p "$(dirname "$ENV_FILE")"

# Write the environment variables from the deployment
echo "PORT=${PORT}" >> $ENV_FILE
echo "DATABASE_URL=${DATABASE_URL}" >> $ENV_FILE
echo "STORAGE_BUCKET_NAME=${STORAGE_BUCKET_NAME}" >> $ENV_FILE
echo "AWS_S3_ENDPOINT=${AWS_S3_ENDPOINT}" >> $ENV_FILE
echo "AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}" >> $ENV_FILE
echo "TOKEN_SECRET=${TOKEN_SECRET}" >> $ENV_FILE

# Optionally source the env file or export variables
source $ENV_FILE

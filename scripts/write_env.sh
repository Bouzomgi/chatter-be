#!/bin/bash

# Create a file to hold environment variables
ENV_FILE="/home/ec2-user/.env"

rm $ENV_FILE

# Create the directory if it doesn't exist
mkdir -p "$(dirname "$ENV_FILE")"

# Fetch the environment variables from SSM Parameter Store and write them to the .env file
echo "export PORT=\"$(aws ssm get-parameter --name /myapp/PORT --query 'Parameter.Value' --output text)\"" >> $ENV_FILE
echo "export DATABASE_URL=\"$(aws ssm get-parameter --name /myapp/DATABASE_URL --query 'Parameter.Value' --output text)\"" >> $ENV_FILE
echo "export STORAGE_BUCKET_NAME=\"$(aws ssm get-parameter --name /myapp/STORAGE_BUCKET_NAME --query 'Parameter.Value' --output text)\"" >> $ENV_FILE
echo "export AWS_S3_ENDPOINT=\"$(aws ssm get-parameter --name /myapp/AWS_S3_ENDPOINT --query 'Parameter.Value' --output text)\"" >> $ENV_FILE
echo "export AWS_DEFAULT_REGION=\"$(aws ssm get-parameter --name /myapp/AWS_DEFAULT_REGION --query 'Parameter.Value' --output text)\"" >> $ENV_FILE
echo "export TOKEN_SECRET=\"$(aws ssm get-parameter --name /myapp/TOKEN_SECRET --with-decryption --query 'Parameter.Value' --output text)\"" >> $ENV_FILE
echo "export AWS_ACCESS_KEY_ID=\"$(aws ssm get-parameter --name /myapp/AWS_ACCESS_KEY_ID --with-decryption --query 'Parameter.Value' --output text)\"" >> $ENV_FILE
echo "export AWS_SECRET_ACCESS_KEY=\"$(aws ssm get-parameter --name /myapp/AWS_SECRET_ACCESS_KEY --with-decryption --query 'Parameter.Value' --output text)\"" >> $ENV_FILE

# Load the environment variables into the current session
source $ENV_FILE

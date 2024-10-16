#!/bin/bash

# Create a file to hold environment variables
ENV_FILE="/home/ec2-user/my-app/.env"

# Create the directory if it doesn't exist
mkdir -p "$(dirname "$ENV_FILE")"

# Fetch the environment variables from SSM Parameter Store and write them to the .env file
echo "PORT=$(aws ssm get-parameter --name /myapp/PORT --query 'Parameter.Value' --output text)" >> $ENV_FILE
echo "DATABASE_URL=$(aws ssm get-parameter --name /myapp/DATABASE_URL --query 'Parameter.Value' --output text)" >> $ENV_FILE
echo "STORAGE_BUCKET_NAME=$(aws ssm get-parameter --name /myapp/STORAGE_BUCKET_NAME --query 'Parameter.Value' --output text)" >> $ENV_FILE
echo "AWS_S3_ENDPOINT=$(aws ssm get-parameter --name /myapp/AWS_S3_ENDPOINT --query 'Parameter.Value' --output text)" >> $ENV_FILE
echo "AWS_DEFAULT_REGION=$(aws ssm get-parameter --name /myapp/AWS_DEFAULT_REGION --query 'Parameter.Value' --output text)" >> $ENV_FILE
echo "TOKEN_SECRET=$(aws ssm get-parameter --name /myapp/TOKEN_SECRET --query 'Parameter.Value' --output text)" >> $ENV_FILE

# Load the environment variables into the current session
source $ENV_FILE
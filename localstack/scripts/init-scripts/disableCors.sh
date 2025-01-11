#!/bin/bash

# Allow some time for LocalStack to initialize before running commands
sleep 5

# Use AWS CLI to remove CORS for an S3 bucket
aws --endpoint-url=http://localhost:$PORT s3api delete-bucket-cors --bucket $STORAGE_BUCKET_NAME || true

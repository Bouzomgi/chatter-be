#!/bin/sh

awslocal s3 mb s3://local-chatter-storage
awslocal s3 sync /content s3://local-chatter-storage/
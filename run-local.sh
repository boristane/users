#!/usr/bin/env bash
set -e

docker-compose up -d

# Wait for the db to be ready
sleep 15

# SNS Topic
aws sns create-topic --name users --endpoint-url 'http://localhost:4575' --region us-west-1

docker exec -t mysql mysql -h 127.0.0.1 -u root -ppassword -e "create database users" || true

# Initialise the db
docker exec -t users npx ts-node ./test/setupDb.ts

# Run the server
docker exec -t users npm run dev
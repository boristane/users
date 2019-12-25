#!/usr/bin/env bash
set -e
pipeline=${PIPELINE_LABEL:-local}
# docker-compose down

# Prevents mounting in the CI
if ! [ ${pipeline} == 'local' ]; then
  sed -i 's/volumes:/#volumes/g' docker-compose.yml
  sed -i 's~- $PWD:/var/users~#- $PWD:/var/users~g' docker-compose.yml
fi

docker-compose up -d

# Check that mysql is ready before creating the database
# while ! docker exec mysql_users mysqladmin --user=root --password=password --host "127.0.0.1" ping --silent &> /dev/null ; do
#   sleep 2
# done

# SNS Topic for emails
aws sns create-topic --name emails --endpoint-url 'http://localhost:4575' --region us-west-1

docker exec -t mysql mysql -h 127.0.0.1 -u root -ppassword -e "create database users" || true
docker exec -t users npx ts-node ./test/setupDb.ts
docker exec -t -e LOG_LEVEL=error users npm run test

# docker-compose down
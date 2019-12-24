#!/bin/bash

if [ "$ENV" = "dev" ] ;
then 
  echo "DEV env";
  npm run dev
else 
  echo "PROD env"; 
  npx ts-node server.ts;
fi;
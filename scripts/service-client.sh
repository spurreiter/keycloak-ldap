#!/bin/bash

# script to login with client credentials

curl -X POST -v \
  -d "client_id=my-service-client" \
  -d "client_secret=16aad716-8d33-4bd8-83c9-32b00630c388" \
  -d "grant_type=client_credentials" \
  -d "scope=openid" \
  http://localhost:8080/auth/realms/my/protocol/openid-connect/token \
| jwtdecode

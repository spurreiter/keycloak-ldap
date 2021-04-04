#!/bin/bash

# script to login with direct grant

curl -X POST -v \
  -d "client_id=my-server" \
  -d "client_secret=3532e9fa-7271-4645-829d-c1fb61c59a47" \
  -d "grant_type=password" \
  -d "scope=openid" \
  --data-urlencode "username=$1" \
  --data-urlencode "password=$2" \
  http://localhost:8080/auth/realms/my/protocol/openid-connect/token \

#| jwtdecode

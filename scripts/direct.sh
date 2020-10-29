#!/bin/bash

curl -X POST -v \
  -d "client_id=my-server" \
  -d "client_secret=3532e9fa-7271-4645-829d-c1fb61c59a47" \
  --data-urlencode "grant_type=password" \
  --data-urlencode "username=bob" \
  --data-urlencode "password=bob" \
  -d "scope=openid" \
  http://localhost:8080/auth/realms/my/protocol/openid-connect/token \

  #| jwtdecode

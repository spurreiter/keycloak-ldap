#!/bin/bash

curl -X POST -v \
  -d "client_id=my-server" \
  -d "client_secret=af5c5f89-8977-482f-9eca-eae83c7f3d0d" \
  --data-urlencode "grant_type=client_credentials" \
  -d "scope=openid" \
  http://localhost:8080/auth/realms/my/protocol/openid-connect/token \

  #| jwtdecode

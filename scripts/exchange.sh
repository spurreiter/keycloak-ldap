#!/bin/bash

token="$1"

curl -X POST -v \
  -d "client_id=my-exchange" \
  -d "client_secret=ac53791f-798b-4e68-8751-a8814815f801" \
  --data-urlencode "grant_type=urn:ietf:params:oauth:grant-type:token-exchange" \
  -d "subject_token=$token" \
  -d "scope=openid message" \
  --data-urlencode "requested_token_type=urn:ietf:params:oauth:token-type:refresh_token" \
  http://localhost:8080/auth/realms/my/protocol/openid-connect/token \

#  | jwtdecode

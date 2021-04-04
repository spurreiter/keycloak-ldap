#!/bin/bash

# script to login with client credentials using
# request header mapper

curl -X POST -v \
  -H "x-org-id: 57a5cb16-1344-470f-8168-24666af9605e" \
  -H "x-tenant-id: 57a5cb16-1344-470f-8168-24666af9605e" \
  -d "client_id=my-client" \
  -d "client_secret=0ab9a3ab-2a1a-408d-8898-e3ce6fc97df0" \
  -d "grant_type=client_credentials" \
  -d "scope=openid" \
  http://localhost:8080/auth/realms/my/protocol/openid-connect/token \
| jwtdecode

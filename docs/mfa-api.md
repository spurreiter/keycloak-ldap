# Multifactor-Authentication-API

The code is generated on the service and send to the OTP to the user.

Expiry and max. number of retries is handled within the service.

Identifiers from the keycloak provided UserModel can be attributed for use as destination address.
Defaults are "phoneNumber" and "email".

## Request a code being sent

After a configurable max-reties an error is returned. In such case the auth-session MUST be reset and the user has to provide username and password again.

```js
POST /
Authentication: Basic <b64(user:pass)> // optional Basic Authentication
{
  nonce: string, // a random string (shall prevent accidental misconfiguration)
  phoneNumber: string,
  email: string,
  username: string, 
  ... // additional properties from UserModel
}
```

**Responses:**

Code was generated and has been sent to either phoneNumber or email.

Initially sent
```js
201 Created
{
  destination: string, // the destination where the OTP Code was sent
  nonce: string, // the random string received 
}
```

Sent with retry (on every retry a new code is generated)
```js
200 OK
{
  destination: string, // the destination where the OTP Code was sent
  nonce: string, // the random string received 
}
```

Bad parameters or max. retires reached. The client shall reset the authentication session here. The user shall re-login with username and password again.
```js
400 Bad Request 
{
  status: 400,
  error: enum(
    "missing_id"    // No identifier to send OTP code found.
    "max_retries"   // max number of retires within expiry time
  ),
}
```

Wrong Basic Auth
```js
401 Forbidden
{
  status: 401,
  error: "invalid_grant",
}
```

Server errors
```js
500 Internal Server Error
{
  status: 500,
  error: "server_error",
}
```

**Verify user input**

Requires a initial code requested via `POST / {}` within the allowed expiry.

```js
PUT /
Authentication: Basic <b64(user:pass)> // optional Basic Authentication
{
  nonce: string, // a random string (shall prevent accidental misconfiguration)
  code: string, // code entered by user 
  username: string, 
  email: string,
  phoneNumber: string,
  ... // additional properties from UserModel
}
```

Verification was ok 
```js 
200 OK 
{
  nonce: string, // the random string received 
}
```

Wrong Basic Auth
```js
401 Forbidden
{
  status: 401,
  error: "invalid_grant",
}
```

Code validation failed.
```js
403 Forbidden
{
  status: 403,
  error: enum(
    "mfa_expired",   // code has expired
    "mfa_invalid",   // code is invalid
    "max_verified",  // max. tries to verify reached. 
  )
}
```

No identifier to send OTP code found.
```js
404 Not Found
{
  status: 404,
  error: "invalid_id"
}
```

Server errors
```js
500 Internal Server Error
{
  status: 500,
  error: "server_error",
}
```

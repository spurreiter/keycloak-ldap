# Create service account

1. Clients > Create
    - Client ID: my-service
2. my-service > Settings
    - Name: my-service
    - Enabled: On
    - Client-Protocol: openid-connect
    - Access Type: Confidential
    - Standard Flow Enabled: Off
    - Implicit Flow Enabled: Off
    - Direct Access Grants Enabled: Off
    - Service Accounts Enabled: On
    - Authorization Enabled: Off
3. my-service > Roles > Add Role
    - Role Name: test
4. Create another client which shall get access to resource
5. Clients > Create > my-service-client
    - Client ID: my-service-client
6. my-service-client > Settings
    - Name: my-service-client
    - Enabled: On
    - Client-Protocol: openid-connect
    - Access Type: Confidential
    - Standard Flow Enabled: Off
    - Implicit Flow Enabled: Off
    - Direct Access Grants Enabled: Off
    - Service Accounts Enabled: On
    - Authorization Enabled: Off
7. my-service-client > Scope
    - Full Scope Allowed: Off
    - Client Roles - my-service  
     - Available Roles: test
     - Button(Add Selected)
       - Assigned Roles: test
8. my-service-client > Service Account Roles  
    _Repeat the same steps as with 7._
    - Client Roles - my-service  
      - Available Roles: test
      - Button(Add Selected)
        - Assigned Roles: test

9. Resulting token payload
    ```js
    {
      exp: '2021-02-17T21:55:33.000Z',
      iat: '2021-02-17T21:50:33.000Z',
      jti: '97920aea-19ef-42f3-8d7d-38305efdc023',
      iss: 'http://localhost:8080/auth/realms/my',
      aud: 'my-service',
      sub: '2969c81f-b74f-4406-be5f-f062530d9786',
      typ: 'Bearer',
      azp: 'my-service-client',
      resource_access: { 'my-service': { roles: [ 'test' ] } },
      scope: 'openid email profile',
      clientId: 'my-service-client'
    }
    ```

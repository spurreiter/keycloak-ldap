/**
 * Realm configuration
 */

const config = require('./config.js')

const adminUser = {
  username: config.username,
  emailVerified: true,
  email: config.email,
  firstName: 'Super',
  lastName: 'Admin'
}

const users = [{
  username: 'jack',
  enabled: true,
  totp: false,
  emailVerified: true,
  firstName: 'Jack',
  lastName: 'Daniels',
  email: 'jack@my.local',
  attributes: {
    orgId: ['30e83fbc-66e4-4c05-a4af-35585b6d756a6'],
    userId: ['6af853e0-15b5-4f37-8364-011e2c6a5f48'],
    phoneNumber: '+10000001'
  }
}, {
  username: 'jim',
  enabled: true,
  emailVerified: true,
  firstName: 'Jim',
  lastName: 'Beam',
  email: 'jim@my.local',
  attributes: {
    orgId: ['30e83fbc-66e4-4c05-a4af-35585b6d756a6'],
    userId: ['92c6ebc5-23b0-4a9c-a895-803dd4aa31a7'],
    phoneNumber: '+10000002'
  }
}]

const realmObj = {
  id: 'my',
  realm: 'my',
  notBefore: 0,
  revokeRefreshToken: false,
  refreshTokenMaxReuse: 0,
  accessTokenLifespan: 300,
  accessTokenLifespanForImplicitFlow: 900,
  ssoSessionIdleTimeout: 1800,
  ssoSessionMaxLifespan: 36000,
  ssoSessionIdleTimeoutRememberMe: 0,
  ssoSessionMaxLifespanRememberMe: 0,
  offlineSessionIdleTimeout: 2592000,
  offlineSessionMaxLifespanEnabled: false,
  offlineSessionMaxLifespan: 5184000,
  clientSessionIdleTimeout: 0,
  clientSessionMaxLifespan: 0,
  clientOfflineSessionIdleTimeout: 0,
  clientOfflineSessionMaxLifespan: 0,
  accessCodeLifespan: 60,
  accessCodeLifespanUserAction: 300,
  accessCodeLifespanLogin: 1800,
  actionTokenGeneratedByAdminLifespan: 43200,
  actionTokenGeneratedByUserLifespan: 300,
  enabled: true,
  sslRequired: 'external',
  registrationAllowed: false,
  registrationEmailAsUsername: false,
  rememberMe: true,
  verifyEmail: false,
  loginWithEmailAllowed: true,
  duplicateEmailsAllowed: false,
  resetPasswordAllowed: true,
  editUsernameAllowed: false,
  bruteForceProtected: false,
  permanentLockout: false,
  maxFailureWaitSeconds: 900,
  minimumQuickLoginWaitSeconds: 60,
  waitIncrementSeconds: 60,
  quickLoginCheckMilliSeconds: 1000,
  maxDeltaTimeSeconds: 43200,
  failureFactor: 30,
  defaultRoles: ['offline_access', 'uma_authorization'],
  requiredCredentials: ['password'],
  otpPolicyType: 'totp',
  otpPolicyAlgorithm: 'HmacSHA1',
  otpPolicyInitialCounter: 0,
  otpPolicyDigits: 6,
  otpPolicyLookAheadWindow: 1,
  otpPolicyPeriod: 30,
  otpSupportedApplications: ['FreeOTP', 'Google Authenticator'],
  webAuthnPolicyRpEntityName: 'keycloak',
  webAuthnPolicySignatureAlgorithms: ['ES256'],
  webAuthnPolicyRpId: '',
  webAuthnPolicyAttestationConveyancePreference: 'not specified',
  webAuthnPolicyAuthenticatorAttachment: 'not specified',
  webAuthnPolicyRequireResidentKey: 'not specified',
  webAuthnPolicyUserVerificationRequirement: 'not specified',
  webAuthnPolicyCreateTimeout: 0,
  webAuthnPolicyAvoidSameAuthenticatorRegister: false,
  webAuthnPolicyAcceptableAaguids: [],
  webAuthnPolicyPasswordlessRpEntityName: 'keycloak',
  webAuthnPolicyPasswordlessSignatureAlgorithms: ['ES256'],
  webAuthnPolicyPasswordlessRpId: '',
  webAuthnPolicyPasswordlessAttestationConveyancePreference: 'not specified',
  webAuthnPolicyPasswordlessAuthenticatorAttachment: 'not specified',
  webAuthnPolicyPasswordlessRequireResidentKey: 'not specified',
  webAuthnPolicyPasswordlessUserVerificationRequirement: 'not specified',
  webAuthnPolicyPasswordlessCreateTimeout: 0,
  webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister: false,
  webAuthnPolicyPasswordlessAcceptableAaguids: [],
  browserSecurityHeaders: {
    contentSecurityPolicyReportOnly: '',
    xContentTypeOptions: 'nosniff',
    xRobotsTag: 'none',
    xFrameOptions: 'SAMEORIGIN',
    contentSecurityPolicy: "frame-src 'self'; frame-ancestors 'self'; object-src 'none';",
    xXSSProtection: '1; mode=block',
    strictTransportSecurity: 'max-age=31536000; includeSubDomains'
  },
  smtpServer: {},
  eventsEnabled: false,
  eventsListeners: ['jboss-logging'],
  enabledEventTypes: [],
  adminEventsEnabled: false,
  adminEventsDetailsEnabled: false,
  internationalizationEnabled: false,
  supportedLocales: [],
  browserFlow: 'browser',
  registrationFlow: 'registration',
  directGrantFlow: 'direct grant',
  resetCredentialsFlow: 'reset credentials',
  clientAuthenticationFlow: 'clients',
  dockerAuthenticationFlow: 'docker auth',
  attributes: {
    clientOfflineSessionMaxLifespan: '0',
    clientSessionIdleTimeout: '0',
    clientSessionMaxLifespan: '0',
    clientOfflineSessionIdleTimeout: '0'
  },
  userManagedAccessAllowed: false
}

const clientScopes = [{
  name: 'my-custom-claim',
  description: 'OpenID Connect custom claim "my"',
  protocol: 'openid-connect',
  attributes: {
    'include.in.token.scope': 'true',
    'display.on.consent.screen': 'false',
    'consent.screen.text': ''
  },
  protocolMappers: [
    {
      name: 'user id',
      protocol: 'openid-connect',
      protocolMapper: 'oidc-usermodel-attribute-mapper',
      consentRequired: false,
      config: {
        'userinfo.token.claim': 'true',
        'user.attribute': 'userId',
        'id.token.claim': 'true',
        'access.token.claim': 'true',
        'claim.name': 'my.user_id',
        'jsonType.label': 'String'
      }
    },
    {
      name: 'org id',
      protocol: 'openid-connect',
      protocolMapper: 'oidc-usermodel-attribute-mapper',
      consentRequired: false,
      config: {
        'userinfo.token.claim': 'true',
        'user.attribute': 'orgId',
        'id.token.claim': 'true',
        'access.token.claim': 'true',
        'claim.name': 'my.org_id',
        'jsonType.label': 'String'
      }
    }
  ]
}]

const clients = [
  {
    clientId: 'my-app',
    description: 'frontend binding single-page-app',
    rootUrl: 'http://localhost:4000',
    adminUrl: 'http://localhost:4000',
    surrogateAuthRequired: false,
    enabled: true,
    alwaysDisplayInConsole: false,
    clientAuthenticatorType: 'client-secret',
    redirectUris: [
      'http://localhost:4000/*'
    ],
    webOrigins: [
      'http://localhost:4000'
    ],
    notBefore: 0,
    bearerOnly: false,
    consentRequired: false,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: false,
    serviceAccountsEnabled: false,
    publicClient: true,
    frontchannelLogout: false,
    protocol: 'openid-connect',
    attributes: {
      'saml.assertion.signature': 'false',
      'saml.force.post.binding': 'false',
      'saml.multivalued.roles': 'false',
      'saml.encrypt': 'false',
      'saml.server.signature': 'false',
      'saml.server.signature.keyinfo.ext': 'false',
      'exclude.session.state.from.auth.response': 'false',
      saml_force_name_id_format: 'false',
      'saml.client.signature': 'false',
      'tls.client.certificate.bound.access.tokens': 'false',
      'saml.authnstatement': 'false',
      'display.on.consent.screen': 'false',
      'saml.onetimeuse.condition': 'false'
    },
    authenticationFlowBindingOverrides: {},
    fullScopeAllowed: true,
    nodeReRegistrationTimeout: -1,
    defaultClientScopes: [
      'role_list',
      'profile',
      'roles',
      'my-custom-claim',
      'email'
    ],
    optionalClientScopes: [
      'address',
      'phone',
      'offline_access',
      'microprofile-jwt'
    ],
    access: {
      view: true,
      configure: true,
      manage: true
    }
  },
  {
    clientId: 'my-server',
    description: 'backend binding server',
    rootUrl: 'http://localhost:4000',
    adminUrl: 'http://localhost:4000',
    surrogateAuthRequired: false,
    enabled: true,
    alwaysDisplayInConsole: false,
    clientAuthenticatorType: 'client-secret',
    redirectUris: [
      'http://localhost:4000/*'
    ],
    webOrigins: [
      'http://localhost:4000'
    ],
    notBefore: 0,
    bearerOnly: false,
    consentRequired: false,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: true,
    serviceAccountsEnabled: false,
    publicClient: true,
    frontchannelLogout: false,
    protocol: 'openid-connect',
    attributes: {
      'saml.assertion.signature': 'false',
      'saml.force.post.binding': 'false',
      'saml.multivalued.roles': 'false',
      'saml.encrypt': 'false',
      'saml.server.signature': 'false',
      'saml.server.signature.keyinfo.ext': 'false',
      'exclude.session.state.from.auth.response': 'false',
      saml_force_name_id_format: 'false',
      'saml.client.signature': 'false',
      'tls.client.certificate.bound.access.tokens': 'false',
      'saml.authnstatement': 'false',
      'display.on.consent.screen': 'false',
      'saml.onetimeuse.condition': 'false'
    },
    authenticationFlowBindingOverrides: {},
    fullScopeAllowed: true,
    nodeReRegistrationTimeout: -1,
    defaultClientScopes: [
      'role_list',
      'profile',
      'roles',
      'my-custom-claim',
      'email'
    ],
    optionalClientScopes: [
      'address',
      'phone',
      'offline_access',
      'microprofile-jwt'
    ],
    access: {
      view: true,
      configure: true,
      manage: true
    }
  },
  {
    clientId: 'my-bearer',
    surrogateAuthRequired: false,
    enabled: true,
    alwaysDisplayInConsole: false,
    clientAuthenticatorType: 'client-secret',
    redirectUris: [],
    webOrigins: [],
    notBefore: 0,
    bearerOnly: true,
    consentRequired: false,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: true,
    serviceAccountsEnabled: false,
    publicClient: false,
    frontchannelLogout: false,
    protocol: 'openid-connect',
    attributes: {
      'saml.assertion.signature': 'false',
      'saml.force.post.binding': 'false',
      'saml.multivalued.roles': 'false',
      'saml.encrypt': 'false',
      'saml.server.signature': 'false',
      'saml.server.signature.keyinfo.ext': 'false',
      'exclude.session.state.from.auth.response': 'false',
      saml_force_name_id_format: 'false',
      'saml.client.signature': 'false',
      'tls.client.certificate.bound.access.tokens': 'false',
      'saml.authnstatement': 'false',
      'display.on.consent.screen': 'false',
      'saml.onetimeuse.condition': 'false'
    },
    authenticationFlowBindingOverrides: {},
    fullScopeAllowed: true,
    nodeReRegistrationTimeout: -1,
    defaultClientScopes: [
      'role_list',
      'profile',
      'roles',
      'my-custom-claim',
      'email'
    ],
    optionalClientScopes: [
      'address',
      'phone',
      'offline_access',
      'microprofile-jwt'
    ],
    access: {
      view: true,
      configure: true,
      manage: true
    }
  }
]

const components = [
  {
    name: 'my-ldap',
    providerId: 'ldap',
    providerType: 'org.keycloak.storage.UserStorageProvider',
    config: {
      pagination: ['true'],
      fullSyncPeriod: ['-1'],
      connectionPooling: ['true'],
      usersDn: ['cn=Users,dc=example,dc=local'],
      cachePolicy: ['DEFAULT'],
      useKerberosForPasswordAuthentication: ['false'],
      importEnabled: ['false'],
      enabled: ['true'],
      usernameLDAPAttribute: ['cn'],
      changedSyncPeriod: ['-1'],
      bindCredential: ['ldap-password'],
      bindDn: ['cn=Administrator,cn=Users,dc=example,dc=local'],
      vendor: ['ad'],
      uuidLDAPAttribute: ['objectGUID'],
      allowKerberosAuthentication: ['false'],
      connectionUrl: ['ldap://host.docker.internal:1389'],
      syncRegistrations: ['false'],
      authType: ['simple'],
      debug: ['false'],
      searchScope: ['1'],
      useTruststoreSpi: ['ldapsOnly'],
      priority: ['0'],
      trustEmail: ['false'],
      userObjectClasses: ['person, organizationalPerson, user'],
      rdnLDAPAttribute: ['cn'],
      editMode: ['WRITABLE'],
      validatePasswordPolicy: ['false'],
      batchSizeForSync: ['1000']
    }
  },
  {
    name: 'username',
    providerId: 'user-attribute-ldap-mapper',
    config: {
      'ldap.attribute': ['cn'],
      'is.mandatory.in.ldap': ['true'],
      'always.read.value.from.ldap': ['false'],
      'read.only': ['false'],
      'user.model.attribute': ['username']
    }
  },
  {
    name: 'first name',
    providerId: 'user-attribute-ldap-mapper',
    config: {
      'ldap.attribute': ['givenName'],
      'is.mandatory.in.ldap': ['true'],
      'always.read.value.from.ldap': ['true'],
      'read.only': ['false'],
      'user.model.attribute': ['firstName']
    }
  },
  {
    name: 'last name',
    providerId: 'user-attribute-ldap-mapper',
    config: {
      'ldap.attribute': ['sn'],
      'is.mandatory.in.ldap': ['true'],
      'always.read.value.from.ldap': ['true'],
      'read.only': ['false'],
      'user.model.attribute': ['lastName']
    }
  },
  {
    name: 'email',
    providerId: 'user-attribute-ldap-mapper',
    config: {
      'ldap.attribute': ['mail'],
      'is.mandatory.in.ldap': ['false'],
      'always.read.value.from.ldap': ['false'],
      'read.only': ['false'],
      'user.model.attribute': ['email']
    }
  },
  {
    name: 'creation date',
    providerId: 'user-attribute-ldap-mapper',
    config: {
      'ldap.attribute': ['whenCreated'],
      'is.mandatory.in.ldap': ['false'],
      'read.only': ['true'],
      'always.read.value.from.ldap': ['true'],
      'user.model.attribute': ['createTimestamp']
    }
  },
  {
    name: 'modify date',
    providerId: 'user-attribute-ldap-mapper',
    config: {
      'ldap.attribute': ['whenChanged'],
      'is.mandatory.in.ldap': ['false'],
      'read.only': ['true'],
      'always.read.value.from.ldap': ['true'],
      'user.model.attribute': ['modifyTimestamp']
    }
  },
  // NEEDS MANUAL SETUP
  (id) => ({
    name: 'orgid',
    providerId: 'user-attribute-ldap-mapper',
    parentId: id,
    config: {
      'ldap.attribute': ['orgId'],
      'is.mandatory.in.ldap': ['false'],
      'read.only': ['true'],
      'always.read.value.from.ldap': ['true'],
      'user.model.attribute': ['orgId']
    }
  }),
  (id) => ({
    name: 'userid',
    providerId: 'user-attribute-ldap-mapper',
    parentId: id,
    config: {
      'ldap.attribute': ['userId'],
      'is.mandatory.in.ldap': ['false'],
      'read.only': ['true'],
      'always.read.value.from.ldap': ['true'],
      'user.model.attribute': ['userId']
    }
  })
]

module.exports = {
  users,
  adminUser,
  realmObj,
  clientScopes,
  clients,
  components
}

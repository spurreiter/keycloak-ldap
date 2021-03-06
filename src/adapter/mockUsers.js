
// https://github.com/keycloak/keycloak/blob/master/examples/ldap/ldap-example-users.ldif

const {
  ADS_UF_NORMAL_ACCOUNT,
  PWD_OK,
  PWD_UPDATE_ON_NEXT_LOGIN
} = require('../constants.js')

const users = [
  // object keys shall be lowercase!
  {
    objectGuid: 'bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd',
    whenCreated: new Date('2020-10-01T12:00:00+00:00').getTime(),
    username: 'alice',
    givenname: 'Alice',
    sn: 'Adams',
    userpassword: 'alice',
    mail: 'alice.adams@my.local',
    phone: '+1180180180',
    memberOf: ['test:read', 'test:write'],
    orgId: '8cbe965e-5481-470b-9388-8d8bf169efc5',
    useraccountcontrol: ADS_UF_NORMAL_ACCOUNT,
    pwdLastSet: PWD_OK,
    emailVerified: true
  },
  {
    objectGuid: '98ac4b01-a63f-4425-9f7c-a8a3d23b052d',
    whenCreated: new Date('2020-10-01T12:10:00+00:00').getTime(),
    username: 'bob',
    givenname: 'Bob',
    sn: 'Builder',
    userpassword: 'bob',
    mail: 'bob.builder@my.local',
    phone: '+1180180181',
    memberOf: ['test:read'],
    orgId: '8cbe965e-5481-470b-9388-8d8bf169efc5',
    useraccountcontrol: ADS_UF_NORMAL_ACCOUNT,
    pwdLastSet: PWD_OK,
    emailverified: false
  },
  {
    objectGuid: 'f17beb47-7ab2-445b-97df-864e118d9d34',
    whenCreated: new Date('2020-10-01T12:15:00+00:00').getTime(),
    username: 'charly',
    givenname: 'Charly',
    sn: 'Chambers',
    userpassword: 'charly',
    mail: 'charly.chanbers@my.local',
    phone: '+1180180182',
    memberOf: ['test:write'],
    orgId: '8cbe965e-5481-470b-9388-8d8bf169efc5',
    useraccountcontrol: ADS_UF_NORMAL_ACCOUNT,
    pwdLastSet: PWD_UPDATE_ON_NEXT_LOGIN,
    emailverified: true
  }
]

const roles = [
  'test:read',
  'test:write',
  'otp:auth',
  'admin',
  // default keycloak roles - required for register workflows
  'offline_access',
  'uma_authorization'
]

module.exports = {
  users,
  roles
}


// https://github.com/keycloak/keycloak/blob/master/examples/ldap/ldap-example-users.ldif

const {
  ADS_UF_NORMAL_ACCOUNT,
  PWD_OK
} = require('./constants.js')

const users = [
  // object keys shall be lowercase!
  {
    objectguid: 'bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd',
    whencreated: new Date('2020-10-01T12:00:00+00:00').getTime(),
    username: 'alice',
    givenname: 'Alice',
    sn: 'Adams',
    userpassword: 'alice',
    mail: 'alice.adams@my.local',
    phone: '+1180180180',
    memberOf: ['test:read', 'test:write'],
    orguuid: '8cbe965e-5481-470b-9388-8d8bf169efc5',
    useraccountcontrol: ADS_UF_NORMAL_ACCOUNT,
    pwdlastset: PWD_OK
  },
  {
    objectguid: '98ac4b01-a63f-4425-9f7c-a8a3d23b052d',
    whencreated: new Date('2020-10-01T12:10:00+00:00').getTime(),
    username: 'bob',
    givenname: 'Bob',
    sn: 'Builder',
    userpassword: 'bob',
    mail: 'bob.builder@my.local',
    phone: '+1180180181',
    memberOf: ['test:read'],
    orgid: '8cbe965e-5481-470b-9388-8d8bf169efc5',
    useraccountcontrol: ADS_UF_NORMAL_ACCOUNT,
    pwdlastset: PWD_OK
  },
  {
    objectguid: 'f17beb47-7ab2-445b-97df-864e118d9d34',
    whencreated: new Date('2020-10-01T12:15:00+00:00').getTime(),
    username: 'charly',
    givenname: 'Charly',
    sn: 'Chambers',
    userpassword: 'charly',
    mail: 'charly.chanbers@my.local',
    phone: '+1180180182',
    memberOf: ['test:write'],
    orgid: '8cbe965e-5481-470b-9388-8d8bf169efc5',
    useraccountcontrol: ADS_UF_NORMAL_ACCOUNT,
    pwdlastset: PWD_OK
  }
]

module.exports = users

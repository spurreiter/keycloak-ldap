const assert = require('assert')
const { Suffix } = require('../src/Suffix.js')
const { toLdapTimestamp, LdapUserMapper, createLdapUserMap } = require('../src/LdapUserMapper.js')
const {
  ADS_UF_NORMAL_ACCOUNT,
  PWD_OK
} = require('../src/constants.js')

describe('LdapUserMapper', function () {
  describe('toLdapTimestamp', function () {
    const date = new Date('2020-11-02T12:34:56Z')

    it('shall return on undefined', function () {
      assert.strictEqual(toLdapTimestamp(), undefined)
    })
    it('shall return on non date value', function () {
      assert.strictEqual(toLdapTimestamp('##'), undefined)
    })
    it('shall convert number value', function () {
      assert.strictEqual(toLdapTimestamp(date.getTime()), '20201102123456Z')
    })
    it('shall convert string value', function () {
      assert.strictEqual(toLdapTimestamp(date.toISOString()), '20201102123456Z')
    })
    it('shall convert date value', function () {
      assert.strictEqual(toLdapTimestamp(date), '20201102123456Z')
    })
  })

  describe('LdapUserMapper', function () {
    const user = {
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
      emailVerified: true,
      accountExpiresAt: new Date('2020-11-01T12:00:00Z').getTime(),
      lastPwdSetAt: new Date('2020-10-02T12:00:00Z').getTime()
    }
    const suffix = new Suffix({ cnUsers: 'Users', ouRoles: 'Roles', dc: 'example.local' })

    it('shall convert user object', function () {
      const ldapUserMap = createLdapUserMap({ suffix })
      const res = new LdapUserMapper(ldapUserMap, user).toLdap()
      assert.deepStrictEqual(res,
        {
          attributes: {
            accountexpires: '20201101120000Z',
            cn: 'alice',
            emailverified: true,
            givenname: 'Alice',
            lastpwdset: '20201002120000Z',
            mail: 'alice.adams@my.local',
            memberof: [
              'cn=test:read,ou=Roles,dc=example,dc=local',
              'cn=test:write,ou=Roles,dc=example,dc=local'
            ],
            objectguid: 'bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd',
            orgid: '8cbe965e-5481-470b-9388-8d8bf169efc5',
            phone: '+1180180180',
            pwdlastset: -1,
            samaccountname: 'alice',
            sn: 'Adams',
            useraccountcontrol: 512,
            userid: 'bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd',
            username: 'alice',
            whencreated: '20201001120000Z'
          },
          dn: 'cn=alice,cn=Users,dc=example,dc=local'
        }
      )
    })

    it('shall update from ldap attributes', function () {
      const mapper = {
        givenname: 'name',
        sn: 'lastName'
      }
      const user = {
        name: 'Alice',
        lastName: 'Adams',
        mail: 'alice.adams@my.local',
        emailVerified: false
      }
      const update = {
        givenname: 'Alicia',
        sn: 'Anders',
        emailverified: true,
        useraccountcontrol: NaN,
        pwdlastset: 0
      }
      const ldapUserMap = createLdapUserMap({ suffix, mapper })
      const res = new LdapUserMapper(ldapUserMap, user).update(update).get()
      assert.deepStrictEqual(res, {
        name: 'Alicia',
        lastName: 'Anders',
        mail: 'alice.adams@my.local',
        emailVerified: true,
        useraccountcontrol: 512,
        pwdLastSet: 0
      })
    })
  })
})

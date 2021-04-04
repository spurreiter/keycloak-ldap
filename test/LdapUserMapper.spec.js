const assert = require('assert')
const { Suffix } = require('../src/Suffix.js')
const { toLdapTimestamp, toLdapInterval, LdapUserMapper, createLdapUserMap } = require('../src/LdapUserMapper.js')
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

  describe('toLdapInterval', function () {
    const date = new Date('2020-11-02T12:34:56Z')

    it('shall return on undefined', function () {
      assert.strictEqual(toLdapInterval(), undefined)
    })
    it('shall return on non date value', function () {
      assert.strictEqual(toLdapInterval('##'), undefined)
    })
    it('shall convert number value', function () {
      assert.strictEqual(toLdapInterval(date.getTime()), 132487940960000)
    })
    it('shall convert string value', function () {
      assert.strictEqual(toLdapInterval(date.toISOString()), 132487940960000)
    })
    it('shall convert date value', function () {
      assert.strictEqual(toLdapInterval(date), 132487940960000)
    })
  })

  describe('LdapUserMapper', function () {
    const cache = {}

    const user = {
      objectGUID: 'bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd',
      createdAt: new Date('2020-10-01T12:00:00+00:00').getTime(),
      updatedAt: new Date('2020-11-01T12:00:00+00:00').getTime(),
      username: 'alice',
      firstName: 'Alice',
      name: 'Adams',
      userPassword: 'alice',
      mail: 'alice.adams@my.local',
      mobile: '+1180180180',
      memberOf: ['test:read', 'test:write'],
      orgId: '8cbe965e-5481-470b-9388-8d8bf169efc5',
      userAccountControl: ADS_UF_NORMAL_ACCOUNT,
      pwdLastSet: PWD_OK,
      emailVerified: true,
      accountExpiresAt: new Date('2020-12-01T12:00:00Z').getTime()
    }
    const suffix = new Suffix({ cnUsers: 'Users', ouRoles: 'Roles', dc: 'example.local' })

    it('throws if user is not an object', function () {
      const ldapUserMap = createLdapUserMap({ suffix })
      assert.throws(() => {
        // eslint-disable-next-line no-new
        new LdapUserMapper(ldapUserMap, '##')
      }, new TypeError('user must be an object'))
    })

    it('throws on set if user is not an object', function () {
      const ldapUserMap = createLdapUserMap({ suffix })
      assert.throws(() => {
        // eslint-disable-next-line no-new
        new LdapUserMapper(ldapUserMap).set('##')
      }, new TypeError('user must be an object'))
    })

    it('shall convert user object', function () {
      const ldapUserMap = createLdapUserMap({ suffix })
      const res = new LdapUserMapper(ldapUserMap, user).toLdap()
      // console.log(res)
      assert.deepStrictEqual(res,
        {
          dn: 'cn=alice,cn=Users,dc=example,dc=local',
          attributes: {
            samaccountname: 'alice',
            cn: 'alice',
            objectguid: 'bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd',
            whencreated: '20201001120000Z',
            whenchanged: '20201101120000Z',
            givenname: 'Alice',
            sn: 'Adams',
            mail: 'alice.adams@my.local',
            mobile: '+1180180180',
            oid: '8cbe965e-5481-470b-9388-8d8bf169efc5',
            useraccountcontrol: 512,
            pwdlastset: -1,
            emailverified: true,
            accountexpires: 132512976000000,
            memberof: [
              'cn=test:read,ou=Roles,dc=example,dc=local',
              'cn=test:write,ou=Roles,dc=example,dc=local'
            ]
          }
        }
      )
      cache.ldap = res
    })

    it('shall convert user object with selected attributes', function () {
      const ldapUserMap = createLdapUserMap({ suffix })
      const res = new LdapUserMapper(ldapUserMap, user).toLdap([
        'objectguid',
        'whencreated',
        'givenname',
        'sn',
        'mail',
        'useraccountcontrol',
        'pwdlastset',
        'orgid',
        'memberof'
      ])
      // console.log(res)
      assert.deepStrictEqual(res,
        {
          dn: 'cn=alice,cn=Users,dc=example,dc=local',
          attributes: {
            samaccountname: 'alice',
            cn: 'alice',
            objectguid: 'bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd',
            whencreated: '20201001120000Z',
            givenname: 'Alice',
            sn: 'Adams',
            mail: 'alice.adams@my.local',
            useraccountcontrol: 512,
            pwdlastset: -1,
            memberof: [
              'cn=test:read,ou=Roles,dc=example,dc=local',
              'cn=test:write,ou=Roles,dc=example,dc=local'
            ]
          }
        }
      )
    })

    it('shall convert it back', function () {
      const ldapUserMap = createLdapUserMap({ suffix })
      const res = new LdapUserMapper(ldapUserMap).update(cache.ldap.attributes).get()

      assert.deepStrictEqual(res, {
        username: 'alice',
        firstName: 'Alice',
        name: 'Adams',
        mail: 'alice.adams@my.local',
        mobile: '+1180180180',
        orgId: '8cbe965e-5481-470b-9388-8d8bf169efc5',
        userAccountControl: 512,
        pwdLastSet: -1,
        emailVerified: true
      })
    })

    it('shall update from ldap attributes with custom mappings', function () {
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
        userAccountControl: 512,
        pwdLastSet: 0
      })
    })
  })
})

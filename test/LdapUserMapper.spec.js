const assert = require('assert')
const { Suffix } = require('../src/Suffix.js')
const {
  toLdapTimestamp,
  toLdapInterval,
  toLdapBinaryUuid,
  LdapUserMapper,
  createLdapUserMap,
  decodeGuid
} = require('../src/LdapUserMapper.js')
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

    it('throws if objectguid is not a UUID', function () {
      assert.throws(() => {
        toLdapBinaryUuid('this is not a uuid')
      }, new Error('not a uuid'))
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
            objectguid: toLdapBinaryUuid('bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd'),
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
            objectguid: toLdapBinaryUuid('bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd'),
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

  describe('toLdapBinaryUuid', function () {
    it('can convert a uuid to ldap binary buffer', function () {
      const uuid = 'f17beb47-7ab2-445b-97df-864e118d9d34'
      const buf = toLdapBinaryUuid(uuid)
      const exp = Buffer.from([
        0x47,
        0xeb,
        0x7b,
        0xf1,
        0xb2,
        0x7a,
        0x5b,
        0x44,
        0x97,
        0xdf,
        0x86,
        0x4e,
        0x11,
        0x8d,
        0x9d,
        0x34
      ])
      assert.deepStrictEqual(buf, exp)
    })
  })

  describe('decodeGuid', function () {
    it('shall decode uuid from alice', function () {
      const objectGuid = '\\a6\\d7\\c0\\bc\\6e\\d8\\e5\\42\\98\\c6\\2a\\d2\\2f\\2d\\38\\bd'
      const exp = 'bcc0d7a6-d86e-42e5-98c6-2ad22f2d38bd'
      const res = decodeGuid(objectGuid)
      assert.strictEqual(res, exp)
    })
    it('shall decode uuid with leading zeros', function () {
      const objectGuid = '\\00\\00\\00\\00\\01\\00\\00\\40\\98\\c6\\2a\\d2\\2f\\2d\\38\\bd'
      const exp = '00000000-0001-4000-98c6-2ad22f2d38bd'
      const res = decodeGuid(objectGuid)
      assert.strictEqual(res, exp)
    })
  })
})

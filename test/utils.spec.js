const assert = require('assert')
const { splitFilter, getUsernameFromCn, unicodepwd } = require('../src/utils.js')

describe('utils', function () {
  describe('splitFilter', function () {
    it('shall split filter', () => {
      const dn = '(&(objectclass=person)(objectclass=organizationalperson)(objectclass=user))'
      const r = splitFilter(dn)
      assert.deepStrictEqual(r, {
        objectclass: ['person', 'organizationalperson', 'user']
      })
    })

    it('shall split filter for user query', () => {
      const dn = '(&(samaccountname=jack)(objectclass=person)(objectclass=organizationalperson)(objectclass=user))'
      const r = splitFilter(dn)
      assert.deepStrictEqual(r, {
        samaccountname: 'jack',
        objectclass: ['person', 'organizationalperson', 'user']
      })
    })
  })

  describe('getUsernameFromCn', function () {
    it('shall obtain common name', function () {
      const dn = 'cn=jack1, cn=Users, dc=example, dc=local'
      assert.strictEqual(getUsernameFromCn(dn), 'jack1')
    })
  })

  describe('unicodepwd', function () {
    it('shall convert a uint16 low endian byte array to a string', function () {
      // https://ldapwiki.com/wiki/UnicodePwd
      const buf = Buffer.from([34, 0, 0x6E, 0x00, 0x65, 0x00, 0x77, 0x00, 0x20, 0x00, 228, 0, 58, 38, 65, 216, 14, 223, 15, 254, 1, 38, 15, 254, 34, 0])
      assert.strictEqual(unicodepwd(buf), 'new ä☺𠜎️☁️')
    })
  })
})

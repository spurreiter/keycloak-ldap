const assert = require('assert')
const { toLdapBinaryUuid, binaryUuidToString } = require('../src/binaryUuid.js')

describe('binaryUuid', function () {
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

  describe('binaryUuidToString', function () {
    it('can convert a binary buffer back to a uuid', function () {
      const uuid = 'f17beb47-7ab2-445b-97df-864e118d9d34'
      const buf = toLdapBinaryUuid(uuid)
      const res = binaryUuidToString(buf)
      assert.deepStrictEqual(res, uuid)
    })
  })
})

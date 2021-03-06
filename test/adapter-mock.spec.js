const assert = require('assert')
const { MockAdapter } = require('../src/adapter/mock.js')
const { PWD_OK, PWD_UPDATE_ON_NEXT_LOGIN } = require('../src/constants.js')

describe('adapter/mock', function () {
  let adapter
  before(function () {
    adapter = new MockAdapter()
  })

  it('searchUsername alice', async function () {
    const user = await adapter.searchUsername('alice')
    // console.log(user)
    assert.strictEqual(user.username, 'alice')
  })

  it('searchUsername unknown', async function () {
    const user = await adapter.searchUsername('unknown')
    assert.strictEqual(user, null)
  })

  it('searchMail bob.builder@my.local', async function () {
    const user = await adapter.searchMail('bob.builder@my.local')
    // console.log(user)
    assert.strictEqual(user.username, 'bob')
  })

  it('searchRole test:write', async function () {
    const role = await adapter.searchRole('test:write')
    assert.strictEqual(role, 'test:write')
  })

  it('searchRole unknown', async function () {
    const role = await adapter.searchRole('unknown')
    assert.strictEqual(role, undefined)
  })

  it('verifyPassword alice', async function () {
    const isValid = await adapter.verifyPassword('alice', 'alice')
    assert.strictEqual(isValid, true)
  })

  it('verifyPassword alice fails', async function () {
    const isValid = await adapter.verifyPassword('alice', 'secret')
    assert.strictEqual(isValid, false)
  })

  it('updatePassword alice', async function () {
    await adapter.updatePassword('alice', 'secret')
    const isValid = await adapter.verifyPassword('alice', 'secret')
    assert.strictEqual(isValid, true)
  })

  it('register denis', async function () {
    await adapter.register('denis')
  })

  it('updateAttributes', async function () {
    const username = 'denis'
    await adapter.updateAttributes(username, {
      mail: 'denis@my.local',
      givenname: 'Denis',
      sn: 'Daffet',
      pwdLastSet: PWD_UPDATE_ON_NEXT_LOGIN
    })
    let user = await adapter.searchUsername(username)
    // console.log(user)
    assert.strictEqual(user.pwdLastSet, PWD_UPDATE_ON_NEXT_LOGIN)

    // set password shall set pwdLastSet to PWD_OK
    await adapter.updatePassword(username, 'secret_d')
    user = await adapter.searchUsername(username)
    // console.log(user)
    assert.strictEqual(user.pwdLastSet, PWD_OK)
  })

  describe('mfa', function () {
    let r
    const mfaCode = { id: 'alice.adams@my.local', code: '123456', expiresAt: 1000, retryCount: 0 }
    before(async function () {
      r = await adapter.upsertMfa(mfaCode)
    })

    it('shall insert a code', function () {
      assert.deepStrictEqual(r, undefined)
    })

    it('shall find the code', async function () {
      const r = await adapter.searchMfa(mfaCode.id)
      const { _id, ...m } = r
      assert.deepStrictEqual(m, mfaCode)
    })

    it('shall not find a code', async function () {
      const r = await adapter.searchMfa('not-there')
      assert.deepStrictEqual(r, null)
    })

    it('shall delete the code', async function () {
      let r = await adapter.removeMfa(mfaCode.id)
      assert.strictEqual(r, 1)
      r = await adapter.searchMfa(mfaCode.id)
      assert.deepStrictEqual(r, null)
    })
  })
})

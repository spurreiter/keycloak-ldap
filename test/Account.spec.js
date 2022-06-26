const assert = require('assert')
const { Account } = require('../src/Account.js')
const sinon = require('sinon')

const {
  ADS_UF_NORMAL_ACCOUNT,
  ADS_UF_PASSWD_NOTREQD,
  ADS_UF_PASSWD_CANT_CHANGE,
  ADS_UF_DONT_EXPIRE_PASSWD,
  ADS_UF_PASSWORD_EXPIRED,
  PWD_OK,
  PWD_UPDATE_ON_NEXT_LOGIN
} = require('../src/constants.js')

describe('Account', function () {
  it('throws if maxPwdAge is NaN', function () {
    assert.throws(() => {
      // eslint-disable-next-line no-new
      new Account({ maxPwdAge: 'NaN' })
    }, TypeError('maxPwdAge is not a number'))
  })

  describe('isExpired', function () {
    before(function () {
      this.clock = sinon.useFakeTimers()
    })
    after(function () {
      this.clock.restore()
    })
    it('no timestamp', function () {
      assert.strictEqual(
        new Account().isExpired({}),
        false
      )
    })
    it('ok', function () {
      assert.strictEqual(
        new Account().isExpired({ accountExpiresAt: 100 }),
        false
      )
    })
    it('expired', function () {
      this.clock.tick(200)
      assert.strictEqual(
        new Account().isExpired({ accountExpiresAt: 100 }),
        true
      )
    })
  })

  describe('passwordResetNeeded', function () {
    let account
    before(function () {
      account = new Account({ maxPwdAge: 1000 })
      this.clock = sinon.useFakeTimers(10000)
    })
    after(function () {
      this.clock.restore()
    })
    it('update needed', function () {
      const user = {}
      assert.deepStrictEqual(
        account.passwordResetNeeded({ ...user }),
        { pwdLastSet: PWD_UPDATE_ON_NEXT_LOGIN }
      )
    })
    it('ADS_UF_PASSWD_CANT_CHANGE', function () {
      const user = { userAccountControl: ADS_UF_PASSWD_CANT_CHANGE }
      assert.deepStrictEqual(
        account.passwordResetNeeded({ ...user }),
        user
      )
    })
    it('ADS_UF_PASSWD_NOTREQD', function () {
      const user = { userAccountControl: ADS_UF_PASSWD_NOTREQD }
      assert.deepStrictEqual(
        account.passwordResetNeeded({ ...user }),
        user
      )
    })
    it('ADS_UF_DONT_EXPIRE_PASSWD', function () {
      const user = { userAccountControl: ADS_UF_DONT_EXPIRE_PASSWD }
      assert.deepStrictEqual(
        account.passwordResetNeeded({ ...user }),
        user
      )
    })
    it('ADS_UF_DONT_EXPIRE_PASSWD - expired', function () {
      const user = {
        userAccountControl: ADS_UF_DONT_EXPIRE_PASSWD,
        pwdLastSetAt: 10,
        pwdLastSet: PWD_OK
      }
      assert.deepStrictEqual(
        account.passwordResetNeeded({ ...user }),
        user
      )
    })
    it('unknown userAccountControl - expired', function () {
      const user = {
        pwdLastSetAt: 10,
        pwdLastSet: PWD_OK
      }
      assert.deepStrictEqual(
        account.passwordResetNeeded({ ...user }),
        { ...user, pwdLastSet: PWD_UPDATE_ON_NEXT_LOGIN }
      )
    })
    it('ADS_UF_NORMAL_ACCOUNT - expired', function () {
      const user = {
        userAccountControl: ADS_UF_NORMAL_ACCOUNT,
        pwdLastSetAt: 10,
        pwdLastSet: PWD_OK
      }
      assert.deepStrictEqual(
        account.passwordResetNeeded({ ...user }),
        { ...user, pwdLastSet: PWD_UPDATE_ON_NEXT_LOGIN }
      )
    })
    it('ADS_UF_PASSWORD_EXPIRED', function () {
      const user = {
        userAccountControl: ADS_UF_PASSWORD_EXPIRED,
        pwdLastSetAt: Date.now() + 1000,
        pwdLastSet: PWD_OK
      }
      assert.deepStrictEqual(
        account.passwordResetNeeded({ ...user }),
        { ...user, pwdLastSet: PWD_UPDATE_ON_NEXT_LOGIN }
      )
    })
  })

  describe('setPassword', function () {
    let account
    before(function () {
      account = new Account({ maxPwdAge: 1000 })
      this.clock = sinon.useFakeTimers(10000)
    })
    after(function () {
      this.clock.restore()
    })
    it('sets a new password', function () {
      const user = {}
      assert.deepStrictEqual(
        account.setPassword({ ...user }, 'kitten'),
        {
          pwdLastSet: PWD_OK,
          pwdLastSetAt: 10000,
          userPassword: 'kitten'
        })
    })
    it('ADS_UF_PASSWORD_EXPIRED changes to ADS_UF_NORMAL_ACCOUNT', function () {
      const user = {
        userAccountControl: ADS_UF_PASSWORD_EXPIRED
      }
      assert.deepStrictEqual(
        account.setPassword({ ...user }, 'kitten'),
        {
          pwdLastSet: PWD_OK,
          pwdLastSetAt: 10000,
          userPassword: 'kitten',
          userAccountControl: ADS_UF_NORMAL_ACCOUNT
        })
    })
  })

  describe('passwordValid', function () {
    let account
    before(function () {
      account = new Account({ maxPwdAge: 1000 })
      this.clock = sinon.useFakeTimers(10000)
    })
    after(function () {
      this.clock.restore()
    })
    it('resets values', function () {
      const user = {
        badPwdCount: 5,
        badPasswordTime: 1000,
        lastLoginAt: 10
      }
      assert.deepStrictEqual(
        account.passwordValid({ ...user }),
        {
          badPwdCount: 0,
          badPasswordTime: 1000,
          lastLoginAt: 10000
        })
    })
  })

  describe('passwordInValid', function () {
    let account
    before(function () {
      account = new Account({ maxPwdAge: 1000 })
      this.clock = sinon.useFakeTimers(10000)
    })
    after(function () {
      this.clock.restore()
    })
    it('increments counter', function () {
      const user = {
        badPwdCount: 0,
        badPasswordTime: 1000,
        lastLoginAt: 10
      }
      assert.deepStrictEqual(
        account.passwordInValid({ ...user }),
        {
          badPwdCount: 1,
          badPasswordTime: 10000,
          lastLoginAt: 10
        })
    })
  })
})

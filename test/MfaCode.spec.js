/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_\\d?$" }] */

const assert = require('assert')
const sinon = require('sinon')
const { MfaCode, ALPHANUMERIC, ALPHANUMERICUPPER, MfaCodeError } = require('../src/mfa/MfaCode.js')

const isNumeric = (length, code) => new RegExp(`^\\d{${length}}$`).test(code)

const isAlphaNumeric = (length, code) => new RegExp(`^[\\da-z]{${length}}$`).test(code)

const isAlphaNumericUpper = (length, code) => new RegExp(`^[\\dA-HJ-NP-Za-km-z]{${length}}$`).test(code)

const log = () => { }
// const log = console.log

describe('MfaCode', function () {
  before(function () {
    this.clock = sinon.useFakeTimers(10)
  })
  after(function () {
    this.clock.restore()
  })

  describe('create', function () {
    it('6 chars numeric', function () {
      const [_, mfa] = new MfaCode().create('alice')
      log(mfa)
      assert.ok(isNumeric(6, mfa.code))
      assert.strictEqual(mfa.id, 'alice')
      assert.strictEqual(mfa.expiresAt, 300010)
      assert.strictEqual(mfa.retryCount, 0)
    })

    it('5 chars alpha numeric', function () {
      const [_, mfa] = new MfaCode({ length: 5, type: ALPHANUMERIC }).create('alice')
      log(mfa)
      assert.ok(isAlphaNumeric(5, mfa.code))
      assert.strictEqual(mfa.id, 'alice')
      assert.strictEqual(mfa.expiresAt, 300010)
      assert.strictEqual(mfa.retryCount, 0)
    })

    it('10 chars alpha numeric uppercase', function () {
      const [_, mfa] = new MfaCode({ length: 10, type: ALPHANUMERICUPPER }).create('alice')
      log(mfa)
      assert.ok(isAlphaNumericUpper(10, mfa.code))
      assert.strictEqual(mfa.id, 'alice')
      assert.strictEqual(mfa.expiresAt, 300010)
      assert.strictEqual(mfa.retryCount, 0)
    })

    it('throws on missing id', function () {
      try {
        new MfaCode().create()
        throw new Error()
      } catch (err) {
        assert.deepStrictEqual(err, new MfaCodeError('missing_id', 400))
      }
    })

    it('resets max retry count after expiry', function () {
      const [_, mfa] = new MfaCode().create('alice', { retryCount: 2, expiresAt: 0 })
      this.clock.tick(300100)
      assert.strictEqual(mfa.retryCount, 0)
    })

    it('shall recreate code within expiry time', function () {
      const id = 'alice'
      const mfaCode = new MfaCode()
      const [_, mfa] = mfaCode.create(id)
      const [_1, mfa1] = mfaCode.create(id, mfa)
      const [_2, mfa2] = mfaCode.create(id, mfa1)
      const [err, mfa3] = mfaCode.create(id, mfa2)
      assert.strictEqual(err.message, 'max_retries')
      assert.strictEqual(mfa3.retryCount, 0)
    })
  })

  describe('verify', function () {
    before(function () {
      this.clock = sinon.useFakeTimers(20)
    })
    after(function () {
      this.clock.restore()
    })

    it('shall verify code', function () {
      const [_, mfa] = new MfaCode().create('alice')
      const [err, changedMfa] = new MfaCode().verify('alice', mfa, mfa.code)
      assert.strictEqual(err, null)
      assert.deepStrictEqual(changedMfa, null)
    })

    it('throws on wrong id', function () {
      try {
        const [_, mfa] = new MfaCode().create('alice')
        new MfaCode().verify('bob', mfa, mfa.code)
        throw new Error()
      } catch (err) {
        assert.deepStrictEqual(err, new MfaCodeError('invalid_id', 404))
      }
    })

    it('throws on expired code', function () {
      const [_, mfa] = new MfaCode().create('alice')
      this.clock.tick(300100)
      const [err, changedMfa] = new MfaCode().verify('alice', mfa, mfa.code)
      assert.deepStrictEqual(err, new MfaCodeError('mfa_expired', 403))
      assert.deepStrictEqual(changedMfa, null)
    })

    it('error on wrong code', function () {
      const [_, mfa] = new MfaCode().create('alice')
      const [err, changedMfa] = new MfaCode().verify('alice', mfa, '111111')
      assert.deepStrictEqual(err, new MfaCodeError('mfa_invalid', 403))
      assert.deepStrictEqual(changedMfa, Object.assign({}, mfa, { verifyCount: 1 }))
    })
  })
})

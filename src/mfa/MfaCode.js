const crypto = require('crypto')

/** @typedef {import('../types').MfaCodeEntity} MfaCodeEntity */

/**
 * Type of mfa code
 * @typedef {number} TypeEnum
 * @enum {number} TypeEnum
 */
const TYPE = {
  NUMERIC: 0,
  ALPHANUMERIC: 1,
  ALPHANUMERICUPPER: 2
}
/** validity in minutes */
const VALID_MINS = 5
/** default length */
const LENGTH = 6
/** max number of retries */
const MAX_RETRY_COUNT = 2
/** max number of failed verifications */
const MAX_VERIFY_COUNT = 2

const SYMBOLS = [
  // NUMERIC
  '0123456789',
  // ALPHANUMERIC
  '0123456789abcdefghijklmnopqrstuvwxyz',
  // ALPHANUMERICUPPER (excludes l and I as too similar and O as confusing with 0)
  '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
]

/**
 * create a mfa code
 * @param {Number} [length=6] (int) length of code
 * @param {TypeEnum} [type=NUMERIC] type of code
 * @returns {String}
 */
function createCode (length = LENGTH, type = TYPE.NUMERIC) {
  let i = 0
  let code = ''
  const symbols = SYMBOLS[type]

  for (i = 0; i < length; i++) {
    const n = crypto.randomInt(symbols.length)
    code += symbols.charAt(n)
  }

  return code
}

/**
 * verify mfa code
 * @param {string} code - original (persisted) code
 * @param {string} value - value (from user input)
 * @returns {boolean} true if valid
 */
function verifyCode (code, value) {
  let isValid = false

  if (typeof value === 'string') {
    value = value.trim()
    if (code.length === value.length) {
      const a = Buffer.from(code)
      const b = Buffer.from(value)
      isValid = crypto.timingSafeEqual(a, b)
    }
  }

  return isValid
}

class MfaCodeError extends Error {
  /**
   * Set error
   * @param {String} message
   * @param {Number} [status=400]
   */
  constructor (message, status = 400) {
    super(message)
    this.status = status
  }
}

class MfaCode {
  /**
   * @constructor
   * @param {object} [param0]
   * @param {number} [param0.validMins=5]
   * @param {number} [param0.length=6]
   * @param {TypeEnum} [param0.type=NUMERIC]
   * @param {number} [param0.maxRetryCount=2]
   * @param {number} [param0.maxVerifyCount=2]
   */
  constructor ({ validMins = VALID_MINS, length = LENGTH, type = TYPE.NUMERIC, maxRetryCount = MAX_RETRY_COUNT, maxVerifyCount = MAX_VERIFY_COUNT } = {}) {
    this.validMsecs = validMins * 60000
    this.length = length
    this.type = type
    this.maxRetryCount = maxRetryCount
    this.maxVerifyCount = maxVerifyCount
  }

  /**
   * create a token
   * @throws {MfaCodeError}
   * @param {string} id - use email or phoneNumber
   * @param {object} [mfa]
   * @param {number} [mfa.retryCount=0]
   * @return {[err: MfaCodeError|null, entity: MfaCodeEntity|null]}
   */
  create (id, mfa) {
    let err = null
    const { length, type, validMsecs, maxRetryCount } = this
    /** @type {MfaCodeEntity} */
    const changedMfa = {
      id,
      expiresAt: Date.now() + validMsecs,
      retryCount: -1,
      verifyCount: 0,
      ...mfa
    }

    changedMfa.retryCount++

    if (!id) {
      throw new MfaCodeError('missing_id', 400)
    } else if (changedMfa.retryCount > maxRetryCount) {
      err = new MfaCodeError('max_retries', 400)
      changedMfa.retryCount = 0
    } else {
      changedMfa.code = createCode(length, type)
    }

    return [err, changedMfa]
  }

  /**
   * verify stored code against userinput
   * @throws {MfaCodeError}
   * @param {String} id
   * @param {MfaCodeEntity} mfa - persisted mfaCode (from db)
   * @param {String} value - value (from user input)
   * @return {[err: MfaCodeError|null, entity: MfaCodeEntity|null]}
   */
  verify (id, mfa, value) {
    let err = null
    /** @type {MfaCodeEntity|null} */
    let changedMfa = Object.assign({ verifyCount: this.maxVerifyCount }, mfa)
    const { id: _id, code, expiresAt } = mfa || {}

    if (!id || _id !== id) {
      throw new MfaCodeError('invalid_id', 404)
    } else if (expiresAt < Date.now()) {
      err = new MfaCodeError('mfa_expired', 403)
      changedMfa = null // delete persisted value
    } else if (!code || !value || !verifyCode(code, value)) {
      err = new MfaCodeError('mfa_invalid', 403)
      changedMfa.verifyCount += 1
    }
    if (changedMfa && changedMfa.verifyCount > this.maxVerifyCount) {
      err = new MfaCodeError('max_verified', 403)
    }
    if (!err) {
      changedMfa = null // delete persisted value
    }

    return [err, changedMfa]
  }
}

module.exports = {
  ...TYPE,
  MfaCode,
  MfaCodeError,
  createCode,
  verifyCode
}

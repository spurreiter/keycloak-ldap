
const DEFAULT_POLICY = {
  minLength: 8,
  maxLength: 40,
  minDigits: 1,
  minLowerChars: 1,
  minUpperChars: 1,
  minSpecialChars: 1,
  notUsername: true,
  notEmail: true,
  notPhone: true
}

/**
 * @typedef {object} Policy
 * @property {number} minLength=8 - min password length
 * @property {number} maxLength=40 - max password length
 * @property {number} minDigits=1 - min digits
 * @property {number} minLowerChars=1 - min lower case chars
 * @property {number} minUpperChars=1 - min lower case chars
 * @property {number} minSpecialChars=1 - min special chars
 * @property {boolean} notUsername=true - does not contain username
 * @property {boolean} notEmail=true - does not contain email
 * @property {boolean} notPhone=true - does not contain phone
 */

class PasswordPolicy {
  /**
   * @constructor
   * @param {Policy} policy
   */
  constructor (policy) {
    this.policy = { ...DEFAULT_POLICY, ...policy }
  }

  /**
   * validate password
   * @param {string} password
   * @param {object} param1
   * @param {string} [param1.username]
   * @param {string} [param1.email]
   * @param {string} [param1.phone]
   * @returns {null|TypeError} if null then password is valid according to policy
   */
  validate (password = '', { username, email, phone } = {}) {
    const {
      minLength,
      maxLength,
      minDigits,
      minLowerChars,
      minUpperChars,
      minSpecialChars,
      notUsername,
      notEmail,
      notPhone
    } = this.policy

    const {
      digits,
      lower,
      upper,
      special
    } = countChars(password)

    let msg

    if (password.length < minLength) {
      msg = 'invalidPasswordMinLength'
    } else if (password.length > maxLength) {
      msg = 'invalidPasswordMaxLength'
    } else if (digits < minDigits) {
      msg = 'invalidPasswordMinDigits'
    } else if (lower < minLowerChars) {
      msg = 'invalidPasswordMinLowerChars'
    } else if (upper < minUpperChars) {
      msg = 'invalidPasswordMinUpperChars'
    } else if (special < minSpecialChars) {
      msg = 'invalidPasswordMinSpecialChars'
    } else if (notUsername && username && password.indexOf(username) !== -1) {
      msg = 'invalidPasswordNotUsername'
    } else if (notEmail && email && containsEmail(password, email)) {
      msg = 'invalidPasswordNotEmail'
    } else if (notPhone && phone && containsPhone(password, phone)) {
      msg = 'invalidPasswordNotPhone'
    }

    return msg ? new TypeError(msg) : null
  }
}

function countChars (str) {
  const r = {
    digits: 0,
    lower: 0,
    upper: 0,
    special: 0
  }

  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    if (c >= 48 && c <= 57) {
      r.digits++
    } else if (c >= 65 && c <= 90) {
      r.upper++
    } else if (c >= 97 && c <= 122) {
      r.lower++
    } else {
      r.special++
    }
  }

  return r
}

function containsEmail (password, email) {
  const _password = password.toLowerCase()
  const _email = email.toLowerCase()
  return _password.indexOf(_email) !== -1
}

const RE_DIGITS = /[^0-9]/g
function containsPhone (password, phone) {
  const _password = password.replace(RE_DIGITS, '')
  const _phone = phone.replace(RE_DIGITS, '')
  return _password.indexOf(_phone) !== -1
}

module.exports = {
  PasswordPolicy
}

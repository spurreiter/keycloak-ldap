
/** @typedef {import('./types').Policy} Policy */

/** @type {Policy} */
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

    // @ts-ignore
    if (password.length < minLength) {
      msg = 'invalidPasswordMinLength'
    // @ts-ignore
    } else if (password.length > maxLength) {
      msg = 'invalidPasswordMaxLength'
    // @ts-ignore
    } else if (digits < minDigits) {
      msg = 'invalidPasswordMinDigits'
    // @ts-ignore
    } else if (lower < minLowerChars) {
      msg = 'invalidPasswordMinLowerChars'
    // @ts-ignore
    } else if (upper < minUpperChars) {
      msg = 'invalidPasswordMinUpperChars'
    // @ts-ignore
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

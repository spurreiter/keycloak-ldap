const {
  ADS_UF_NORMAL_ACCOUNT,
  ADS_UF_PASSWD_NOTREQD,
  ADS_UF_PASSWD_CANT_CHANGE,
  ADS_UF_DONT_EXPIRE_PASSWD,
  ADS_UF_PASSWORD_EXPIRED,
  PWD_OK,
  PWD_UPDATE_ON_NEXT_LOGIN
} = require('./constants.js')

class Account {
  /**
   * @param {object} opts 
   * @param {number} [opts.maxPwdAge] - max password age in milliSecs. Default is 90 days. 
   */
  constructor (opts) {
    Object.assign({
      maxPwdAge: 90 * 24 * 60 * 60 * 1000
    }, opts)
  }

  /**
   * @param {object} user
   * @returns {boolean} - true if expired
   */
  isExpired (user) {
    if (user.accountExpiresAt) {
      const expiresAt = new Date(user.accountExpiresAt)
      return expiresAt < new Date()
    }
  }

  /**
   * checks if password reset is needed and sets user attributes
   * @param {object} user
   * @returns {object} user
   */
  passwordResetNeeded (user) {
    const {
      pwdLastSetAt = 0,
      pwdLastSet,
      userAccountControl = ADS_UF_NORMAL_ACCOUNT
    } = user

    const doUpdate = (
      userAccountControl !== ADS_UF_PASSWD_CANT_CHANGE &&
      userAccountControl !== ADS_UF_PASSWD_NOTREQD &&
      userAccountControl !== ADS_UF_DONT_EXPIRE_PASSWD
    ) && (
      (pwdLastSetAt + this.maxPwdAge) < Date.now() ||
      pwdLastSet === PWD_UPDATE_ON_NEXT_LOGIN ||
      userAccountControl === ADS_UF_PASSWORD_EXPIRED
    )

    if (doUpdate) {
      user.pwdLastSet = PWD_UPDATE_ON_NEXT_LOGIN
    }

    return user
  }

  /**
   * sets a new password
   * @param {object} user
   * @returns {object} user
   */
  setPassword (user, password) {
    const {
      userAccountControl = ADS_UF_NORMAL_ACCOUNT
    } = user
    if (userAccountControl === ADS_UF_PASSWORD_EXPIRED) {
      user.userAccountControl = ADS_UF_NORMAL_ACCOUNT
    }
    user.userPassword = password
    user.pwdLastSet = PWD_OK
    user.pwdLastSetAt = Date.now()
    return user
  }

  /** 
   * password is valid, resets badPwdCount and sets lastLoginAt
   * @param {object} user
   * @returns {object} user
   */
  passwordValid (user) {
    user.badPwdCount = 0
    user.lastLoginAt = Date.now()
    return user
  }

  /**
   * password is invalid, increments badPwdCount
   * @param {object} user
   * @returns {object} user
   */
  passwordInValid (user) {
    user.badPasswordTime = Date.now()
    user.badPwdCount = (user.badPwdCount || 0) + 1
    return user
  }
}

module.exports = {
  Account
}

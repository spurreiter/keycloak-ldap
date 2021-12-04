const Datastore = require('nedb')
const { IAdapter } = require('./interface.js')
const log = require('../log.js').log('MockAdapter')
const { users, roles, defaultRoles } = require('./mockUsers.js')
const { PasswordPolicy } = require('../PasswordPolicy.js')
const { Account } = require('../Account.js')

class MockDataStore {
  constructor (opts) {
    this.data = new Datastore(opts)
  }

  insert (items) {
    return new Promise((resolve, reject) => {
      this.data.insert(items, (err) => {
        if (err) reject(err)
        else resolve(undefined)
      })
    })
  }

  update (query, item) {
    return new Promise((resolve, reject) => {
      this.data.update(query, item, (err, count, isUpsert) => {
        if (err) reject(err)
        else resolve({ count, isUpsert })
      })
    })
  }

  async upsert (query, item) {
    const { count } = await this.update(query, item)
    if (!count) {
      return this.insert([item])
    }
  }

  find (query) {
    return new Promise((resolve, reject) => {
      this.data.find(query, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  findOne (query) {
    return new Promise((resolve, reject) => {
      this.data.findOne(query, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  remove (query) {
    return new Promise((resolve, reject) => {
      this.data.remove(query, (err, count) => {
        if (err) reject(err)
        else resolve(count)
      })
    })
  }
}

// ---

class MockAdapter extends IAdapter {
  constructor (opts) {
    super()
    this._account = new Account(opts)
    this._users = new MockDataStore()
    this._users.insert(users)
    this._roles = roles
    this._policy = new PasswordPolicy({
      minLength: 3,
      minDigits: 0,
      minLowerChars: 1,
      minUpperChars: 0,
      minSpecialChars: 0,
      notUsername: false
    })
    this._mfa = new MockDataStore()
  }

  checkUser (user) {
    if (user && !this._account.isExpired(user)) {
      this._account.passwordResetNeeded(user)
      // assign other data
      user.uid = user.objectGUID
      return user
    }
    return null
  }

  searchUsername (username) {
    return this._users
      .findOne({ username })
      .then((user) => this.checkUser(user))
      .catch((err) => {
        log.error(err)
        // return undefined here - not the error
      })
  }

  searchMail (mail) {
    return this._users
      .findOne({ mail })
      .then((user) => this.checkUser(user))
      .catch((err) => {
        log.error(err)
        // return undefined here - not the error
      })
  }

  searchGuid (objectGUID) {
    return this._users
      .findOne({ objectGUID })
      .then((user) => this.checkUser(user))
      .catch((err) => {
        log.error(err)
        // return undefined here - not the error
      })
  }

  async searchRole (role) {
    if (/^default-roles-[a-z]+$/.test(role)) {
      return defaultRoles
    }
    const hasRole = this._roles.includes(role)
    if (hasRole) {
      return role
    }
  }

  syncAllUsers () {
    return this._users.find({})
  }

  async syncAllRoles () {
    return this._roles
  }

  async verifyPassword (username, password) {
    log.debug({ username, password })
    let user = await this.searchUsername(username)

    if (!user) {
      return Promise.reject(new Error('user not found'))
    }
    const { userPassword } = user

    if (this._account.isExpired(user)) {
      return false
    }

    const isValid = await validatePassword(userPassword, password)
    log.debug({ username, isValid })

    if (isValid) {
      user = this._account.passwordValid(user)
    } else {
      user = this._account.passwordInValid(user)
    }
    this._users.update({ username }, user)

    return isValid
  }

  async updatePassword (username, newPassword) {
    log.debug('updatePassword %j', { username, newPassword })
    let user = await this.searchUsername(username)

    if (!user) {
      return Promise.reject(new Error('user not found'))
    }

    const violatesPwdPolicyErr = this._policy.validate(newPassword, {
      username
    })
    if (violatesPwdPolicyErr) {
      return Promise.reject(violatesPwdPolicyErr)
    }

    user = this._account.setPassword(user, newPassword)

    await this._users.update({ username }, user)
  }

  async updateAttributes (username, attributes) {
    log.debug('updateAttributes: %j', { username, attributes })
    const user = await this.searchUsername(username)
    if (!user) {
      return Promise.reject(new Error('user not found'))
    }

    Object.entries(attributes).forEach(([attr, value]) => {
      user[attr] = value
    })

    return this._users.update({ username }, user)
  }

  async register (username) {
    log.debug('register %j', { username })

    const _user = await this.searchUsername(username)
    if (_user) {
      return Promise.reject(new Error('user already exists'))
    }

    const user = this._account.register(username)

    return this._users.insert([user])
  }

  upsertMfa (mfa) {
    return this._mfa.upsert({ id: mfa.id }, mfa)
  }

  /**
   * @param {string} id
   * @returns {Promise<import('../mfa/MfaCode.js').MfaCodeEntity>}
   */
  searchMfa (id) {
    return this._mfa.findOne({ id })
  }

  /**
   * @param {string} id
   * @returns {Promise}
   */
  removeMfa (id) {
    return this._mfa.remove({ id })
  }
}

module.exports = {
  MockAdapter
}

function toArray (str) {
  return (str || '').split('')
}

function timingSafeEqual (_a, _b) {
  const a = toArray(_a)
  const b = toArray(_b)
  let diff = (a.length !== b.length)
  for (let i = 0; i < b.length; i++) {
    diff ||= (a[i] !== b[i])
  }
  return !diff
}

// simulate password comparison
function validatePassword (userpassword, password) {
  return new Promise(resolve => {
    setTimeout(() => {
      const isValid = timingSafeEqual(userpassword, password)
      resolve(isValid)
    }, 300)
  })
}

const { IAdapter } = require('./interface.js')
const log = require('../log.js').log('MockAdapter')

const users = require('./mockUsers.js')

function reduce (arr, by) {
  return arr.reduce((map, item) => {
    map.set(item[by], item)
    return map
  }, new Map())
}

function getUser (user, suffix) {
  const { userpassword, memberOf, ...rest } = user
  const { username, objectguid } = user
  if (memberOf) {
    rest.memberOf = memberOf.map(group => `cn=${group},ou=RealmRoles,dc=example,dc=local`)
  }
  return {
    dn: `cn=${username},${suffix}`,
    attributes: {
      userpassword, // TODO: remove
      samaccountname: username,
      cn: username,
      ...rest,
      userid: objectguid
    }
  }
}

function toArray (str) {
  return (str || '').split('')
}

function timingSafeEqual (_a, _b) {
  const a = toArray(_a)
  const b = toArray(_b)
  let diff = (a.length !== b.length)
  for (let i = 0; i < b.length; i++) {
    diff |= (a[i] !== b[i])
  }
  return (diff === 0)
}

class MockAdapter extends IAdapter {
  constructor ({ suffix }) {
    super()
    this._suffix = suffix
    this._usernames = reduce(users, 'username')
    this._mails = reduce(users, 'mail')
  }

  async searchUsername (username) {
    return new Promise((resolve) => {
      const user = this._usernames.get(username)
      if (user) {
        const obj = getUser(user, this._suffix)
        resolve(obj)
      } else {
        resolve()
      }
    })
  }

  async searchMail (mail) {
    return new Promise((resolve) => {
      const user = this._mails.get(mail)
      if (user) {
        const obj = getUser(user, this._suffix)
        resolve(obj)
      } else {
        resolve()
      }
    })
  }

  async syncAllUsers () {
    log('syncAllUsers')
    return new Promise((resolve) => {
      const users = Array.from(this._usernames.values())
        .map(user => getUser(user, this._suffix))
      resolve(users)
    })
  }

  async verifyPassword (username, password) {
    log({ username, password })
    return new Promise((resolve) => {
      const user = this._usernames.get(username)
      const { userpassword } = user
      const isValid = timingSafeEqual(userpassword, password)
      log({ username, isValid })
      // simulate hash calc
      setTimeout(() => {
        resolve(isValid)
      }, 300)
    })
  }

  async updatePassword (username, newPassword) {
    log('updatePassword %j', { username, newPassword })
    return new Promise((resolve, reject) => {
      const user = this._usernames.get(username)
      if (!user) {
        reject(new Error('user not found'))
        return
      }
      user.userpassword = newPassword
      this._usernames.set(username, user)
      resolve()
    })
  }

  // debounce function on update
  async updateAttribute (username, attr, value) {
    log('updateAttribute %j', { username, attr, value })
    return new Promise((resolve, reject) => {
      const user = this._usernames.get(username)
      if (!user) {
        reject(new Error('user not found'))
        return
      }
      user[attr] = value
      this._usernames.set(username, user)
      resolve()
    })
  }
}

module.exports = {
  MockAdapter,
  getUser
}

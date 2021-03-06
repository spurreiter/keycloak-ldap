const { ADS_UF_NORMAL_ACCOUNT, PWD_UPDATE_ON_NEXT_LOGIN } = require('./constants.js')
const { toNumber } = require('./utils.js')

// attribute mapper
const attributeMapper = {
  // ldap name -- key from user model
  emailverified: 'emailVerified',
  givenname: 'givenname',
  mail: 'mail',
  memberof: 'memberOf',
  objectguid: 'objectGuid',
  orgid: 'orgId',
  phone: 'phone',
  pwdlastset: 'pwdLastSet',
  sn: 'sn',
  useraccountcontrol: 'useraccountcontrol',
  username: 'username',
  userpassword: 'userpassword', // (hashed) user password
  whencreated: 'whenCreated', // creation time stamp
  whenchanged: 'whenChanged', // update time stamp
  lastlogon: 'lastLogonAt', // last logon time stamp
  lastpwdset: 'lastPwdSetAt', // password last changed time stamp
  accountexpires: 'accountExpiresAt' // account expiry time stamp
}

const TIMESTAMPS = [
  'whencreated',
  'whenchanged',
  'lastlogon',
  'lastpwdset',
  'accountexpires'
]

/**
 * @see https://www.epochconverter.com/ldap
 * @param {Date|string|number} date
 * @return {string}
 */
function toLdapTimestamp (date) {
  if (date === undefined) return
  const d = new Date(date)
  if (isNaN(d.getTime())) return
  const ts = d.toISOString().substring(0, 19).replace(/[^0-9]/g, '') + 'Z'
  return ts
}

/**
 * normalize attribute before update
 * @param  {string} attr - attribute
 * @param  {any} value - value which may need normalization
 * @return {any} normalized value
 */
const normalizeAttribute = (attr, value) => {
  switch (attr) {
    case 'emailverified': {
      value = value !== 'false'
      break
    }
    case 'useraccountcontrol': {
      value = toNumber(value, ADS_UF_NORMAL_ACCOUNT)
      break
    }
    case 'pwdlastset': {
      value = toNumber(value, PWD_UPDATE_ON_NEXT_LOGIN)
      break
    }
  }
  return value
}

/**
 * @typedef {object} LdapUserMap
 * @property {Suffix} suffix - user and roles suffix instance
 * @property {object} mapper - attribute mapper for storage
 * @property {object} mapperToLdap - attribute mapper for LDAP proto
 */

/**
 * create ldap user map
 * @param {object} param0
 * @param {Suffix} param0.suffix - instance of Suffix
 * @param {object} param0.mapper - custom mapper object
 * @return {LdapUserMap}
 */
function createLdapUserMap ({ suffix, mapper = {} }) {
  const _mapper = Object.assign({}, attributeMapper, mapper)
  const mapperToLdap = Object.entries(_mapper).reduce((o, [key, val]) => {
    o[val] = key
    return o
  }, {})

  return {
    suffix,
    mapper: _mapper,
    mapperToLdap
  }
}

/**
 * map user attributes to ldap attributes
 */
class LdapUserMapper {
  /**
   * [constructor description]
   * @param {LdapUserMap} ldapUserMap - result from createLdapUserMap()
   * @param {object} [user] - user object
   */
  constructor (ldapUserMap, user = {}) {
    Object.assign(this, ldapUserMap, { user })
  }

  /**
   * get user object for storage in database
   * @return {object} user object
   */
  get () {
    const user = this.user
    return user
  }

  /**
   * set user from database
   * @param {this}
   */
  set (user) {
    this.user = user
    return this
  }

  /**
   * update ldap attributes
   * @param {object} ldapAttributes
   * @return {this}
   */
  update (ldapAttributes) {
    if (!this.user) {
      throw new Error('no user')
    }
    Object.entries(ldapAttributes).forEach(([attr, val]) => {
      const key = this.mapper[attr] || attr
      this.user[key] = normalizeAttribute(attr, val)
    })
    return this
  }

  /**
   * get ldap user object
   * @return {[type]}
   */
  toLdap () {
    if (!this.user) return null

    const user = Object.entries(this.user).reduce((o, [key, val]) => {
      const attr = this.mapperToLdap[key] || key
      if (TIMESTAMPS.includes(attr)) {
        val = toLdapTimestamp(val)
      }
      o[attr] = val
      return o
    }, {})

    // omit userpassword in LDAP response
    const { _id, userpassword, memberof, ...rest } = user
    const { username, objectguid } = user
    if (memberof) {
      rest.memberof = memberof.map(group => this.suffix.suffixRoles(group))
    }
    const ldap = {
      dn: this.suffix.suffixUsers(username), // `cn=${username},${suffix}`,
      attributes: {
        samaccountname: username,
        cn: username,
        ...rest,
        userid: objectguid
      }
    }

    return ldap
  }
}

module.exports = {
  createLdapUserMap,
  LdapUserMapper,
  toLdapTimestamp
}

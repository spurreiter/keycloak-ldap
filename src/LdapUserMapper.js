const { 
  ADS_UF_NORMAL_ACCOUNT,
  PWD_UPDATE_ON_NEXT_LOGIN
} = require('./constants.js')
const { toNumber } = require('./utils.js')


/**
 * attribute mapper
 * LDAP-name (all in lowercase!) <-> field from user-model
 * see server-spi-private/src/main/java/org/keycloak/models/LDAPConstants.java
 */
const attributeMapper = {
  objectguid: 'objectGUID', // read only
  whencreated: 'createdAt', // creation time stamp
  whenchanged: 'updatedAt', // update time stamp
  // user-data
  uid: 'uid',
  cn: 'username',
  givenname: 'firstName',
  sn: 'name',
  middlename: 'middleName',
  nickname: 'nickName',
  gender: 'gender',
  preferredlanguage: 'language',
  timezone: 'timezone',
  memberof: 'memberOf',
  oid: 'orgId', // organisation Id - non-standard
  dateofbirth: 'dateOfBirth', // YYYY-MM-DD
  // devices
  mail: 'mail',
  emailverified: 'emailVerified', // non-standard
  mobile: 'mobile',
  mobileverified: 'mobileVerified',
  // account-data
  useraccountcontrol: 'userAccountControl',
  userpassword: 'userPassword', // (hashed) user password
  pwdlastset: 'pwdLastSet',
  badpasswordtime: 'badPasswordTime', // interval
  badpwdcount: 'badPwdCount',
  accountexpires: 'accountExpiresAt' // interval
}

const READONLY_ATTRS = [
  'objectguid',
  'samaccountname',
  'whencreated',
  'whenchanged',
  'badpasswordtime',
  'badpwdcount',
  'accountexpires',
  'memberof' // FIXME: Filter out only the cn
]

const GENERALIZED_TIME = [
  'whencreated',
  'whenchanged'
]

const JAN1601 = 11644473600000 // milliseconds since 1601-01-01 till 1970-01-01
const INTERVAL_TIME = [
  'badpasswordtime',
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

function toLdapInterval (date) {
  if (date === undefined) return
  const d = new Date(date)
  if (isNaN(d.getTime())) return
  const ts = (d.getTime() + JAN1601) * 10 // 100ns intervals
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
    case 'mobileverified':
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
   * @param {boolean} [doPassReadonly] - do not filter readonly values
   * @return {this}
   */
  update (ldapAttributes, doPassReadonly) {
    if (!this.user) {
      throw new Error('no user')
    }
    Object.entries(ldapAttributes).forEach(([attr, val]) => {
      if (!doPassReadonly && READONLY_ATTRS.includes(attr)) return
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
      if (GENERALIZED_TIME.includes(attr)) {
        val = toLdapTimestamp(val)
      }
      if (INTERVAL_TIME.includes(attr)) {
        val = toLdapInterval(val)
      }
      o[attr] = val
      return o
    }, {})

    // omit userpassword in LDAP response
    const { _id, userpassword, memberof, ...rest } = user
    const { cn, uid, objectguid } = user
    if (memberof) {
      rest.memberof = memberof.map(group => this.suffix.suffixRoles(group))
    }
    const ldap = {
      dn: this.suffix.suffixUsers(cn), // `cn=${username},${suffix}`,
      attributes: {
        samaccountname: cn,
        cn: cn,
        ...rest,
        uid: uid || objectguid
      }
    }

    return ldap
  }
}

module.exports = {
  createLdapUserMap,
  LdapUserMapper,
  toLdapTimestamp,
  toLdapInterval
}
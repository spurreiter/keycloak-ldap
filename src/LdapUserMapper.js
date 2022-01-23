const {
  ADS_UF_NORMAL_ACCOUNT,
  PWD_UPDATE_ON_NEXT_LOGIN
} = require('./constants.js')
const { toNumber } = require('./utils.js')

/** @typedef {import('./Suffix').Suffix } Suffix */

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
 * @return {string|undefined}
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

function toLdapBinaryUuid (uuid) {
  const hex = String(uuid).replace(/-/g, '')
  if (hex.length !== 32) {
    throw new Error('not a uuid')
  }
  const m = [3, 2, 1, 0, 5, 4, 7, 6]
  const a = new Array(16)
  for (let i = 0; i < 16; i++) {
    const n = parseInt(hex.substr(i * 2, 2), 16)
    const p = m[i] ?? i
    a[p] = n
  }
  const buf = Buffer.from(a)
  return buf
}

function decodeGuid (objectGuid) {
  const guid = objectGuid.split('\\')
  guid.shift()

  const uuid = [
    guid[3], guid[2], guid[1], guid[0], '-',
    guid[5], guid[4], '-',
    guid[7], guid[6], '-',
    guid[8], guid[9], '-',
    guid[10], guid[11], guid[12], guid[13], guid[14], guid[15]
  ].join('')

  return uuid
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
 * @property {Suffix} suffix user and roles suffix instance
 * @property {object} mapper attribute mapper for storage
 * @property {object} mapperToLdap attribute mapper for LDAP proto
 */

/**
 * create ldap user map
 * @param {object} param0
 * @param {Suffix} param0.suffix instance of Suffix
 * @param {object} param0.mapper custom mapper object
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
   * @constructor
   * @throws {TypeError} if user is not an object
   * @param {LdapUserMap} ldapUserMap result from createLdapUserMap()
   * @param {object} [user] user object
   */
  constructor (ldapUserMap, user = {}) {
    this.mapper = undefined
    this.mapperToLdap = undefined
    this.suffix = undefined
    Object.assign(this, ldapUserMap, { user })
    this._checkType()
  }

  /**
   * @private
   */
  _checkType () {
    if (typeof this.user !== 'object' || this.user === null) {
      throw new TypeError('user must be an object')
    }
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
   * @throws {TypeError}
   * @param {object} user
   * @returns {this}
   */
  set (user) {
    this.user = user
    this._checkType()
    return this
  }

  /**
   * update ldap attributes
   * @param {object} ldapAttributes
   * @param {boolean} [ignoreReadonly] - do not filter readonly values
   * @return {this}
   */
  update (ldapAttributes, ignoreReadonly) {
    Object.entries(ldapAttributes).forEach(([attr, val]) => {
      if (!ignoreReadonly && READONLY_ATTRS.includes(attr)) return
      const key = this.mapper[attr] || attr
      this.user[key] = normalizeAttribute(attr, val)
    })
    return this
  }

  /**
   * get ldap user object
   * @param {string[]} attributes - required attributes
   * @return {object} mapped ldap object
   */
  toLdap (attributes) {
    const hasAttributes = attributes && attributes.length
    const user = Object.entries(this.user).reduce((o, [key, val]) => {
      const attr = this.mapperToLdap[key] || key

      if (hasAttributes && attr !== 'cn' && !attributes.includes(attr)) {
        return o
      }
      if (attr === 'objectguid') {
        val = toLdapBinaryUuid(val)
      } else if (GENERALIZED_TIME.includes(attr)) {
        val = toLdapTimestamp(val)
      } else if (INTERVAL_TIME.includes(attr)) {
        val = toLdapInterval(val)
      }
      o[attr] = val
      return o
    }, {})

    // omit userpassword in LDAP response
    // @ts-ignore
    const { _id, userpassword, memberof, ...rest } = user
    // @ts-ignore
    const { cn } = user
    if (memberof) {
      // @ts-ignore
      rest.memberof = memberof.map(group => this.suffix.suffixRoles(group))
    }
    const ldap = {
      dn: this.suffix.suffixUsers(cn), // `cn=${username},${suffix}`,
      attributes: {
        samaccountname: cn,
        cn: cn,
        ...rest
      }
    }

    return ldap
  }
}

module.exports = {
  createLdapUserMap,
  decodeGuid,
  LdapUserMapper,
  toLdapTimestamp,
  toLdapInterval,
  toLdapBinaryUuid
}

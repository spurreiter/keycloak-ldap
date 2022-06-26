const {
  ADS_UF_NORMAL_ACCOUNT,
  PWD_UPDATE_ON_NEXT_LOGIN
} = require('./constants.js')
const { toNumber } = require('./utils.js')
const { toLdapBinaryUuid } = require('./binaryUuid.js')

/**
 * attribute mapper
 * @see https://ldapwiki.com
 * LDAP-name (all in lowercase!) <-> field from user-model
 * see server-spi-private/src/main/java/org/keycloak/models/LDAPConstants.java
 */
const attributeMapper = {
  userPrincipalName: 'userPrincipalName',
  objectGUID: 'objectGUID', // read only
  whenCreated: 'createdAt', // creation time stamp
  whenChanged: 'updatedAt', // update time stamp
  // user-data
  uid: 'uid',
  cn: 'username',
  givenName: 'firstName',
  sn: 'name',
  middleName: 'middleName',
  nickName: 'nickName',
  gender: 'gender',
  preferredLanguage: 'language',
  timezone: 'timezone',
  memberOf: 'memberOf',
  oid: 'orgId', // organisation Id - non-standard
  dateOfBirth: 'dateOfBirth', // YYYY-MM-DD
  // devices
  mail: 'mail',
  emailVerified: 'emailVerified', // non-standard
  mobile: 'mobile',
  mobileVerified: 'mobileVerified',
  // account-data
  userAccountControl: 'userAccountControl',
  userPassword: 'userPassword', // (hashed) user password
  pwdLastSet: 'pwdLastSet',
  badPasswordTime: 'badPasswordTime', // interval
  badPwdCount: 'badPwdCount',
  accountExpires: 'accountExpiresAt' // interval
}

const READONLY_ATTRS = [
  'userprincipalname',
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
 * @param  {string} attr - lowercase attribute
 * @param  {any} value - value which may need normalization
 * @return {any} normalized value
 */
const normalizeAttribute = (attr, value) => {
  switch (attr.toLowerCase()) {
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
  // merged attribute mapper
  const _mapper = Object.assign({}, attributeMapper, mapper)
  // reversed mapings for ldap
  const ldapMapper = Object.entries(_mapper).reduce((o, [ldapA, userA]) => {
    o[userA] = ldapA.toLowerCase()
    return o
  }, {})
  // need case mapper as req.attributes is always in lowercase
  const caseMapper = Object.keys(_mapper).reduce((o, ldapA) => {
    o[ldapA.toLowerCase()] = ldapA
    return o
  }, {})

  const ldapAttrFromLc = (lcA) => {
    const ldapA = caseMapper[lcA.toLowerCase()] || lcA
    return ldapA
  }
  const userAttrFromLc = (lcA) => {
    const ldapA = ldapAttrFromLc(lcA)
    return _mapper[ldapA] || lcA
  }
  const lcAttrFromUser = (userA) => {
    const lcA = ldapMapper[userA] || userA
    return lcA
  }

  return {
    suffix,
    ldapAttrFromLc,
    userAttrFromLc,
    lcAttrFromUser
  }
}

/**
 * map user attributes to ldap attributes
 */
class LdapUserMapper {
  /**
   * @constructor
   * @throws {TypeError} if user is not an object
   * @param {LdapUserMap} ldapUserMap - result from createLdapUserMap()
   * @param {object} [user] - user object
   */
  constructor (ldapUserMap, user = {}) {
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
   * @param {this}
   */
  set (user) {
    this.user = user
    this._checkType()
    return this
  }

  /**
   * update ldap attributes
   * @param {object} ldapAttributes - lower cased ldap attributes
   * @param {boolean} [ignoreReadonly] - do not filter readonly values
   * @return {this}
   */
  update (ldapAttributes, ignoreReadonly) {
    Object.entries(ldapAttributes).forEach(([attr, val]) => {
      if (!ignoreReadonly && READONLY_ATTRS.includes(attr)) return
      const key = this.userAttrFromLc(attr)
      this.user[key] = normalizeAttribute(attr, val)
    })
    return this
  }

  /**
   * get ldap user object
   * @param {string[]} attributes - required attributes (in lowercase!)
   * @return {[type]}
   */
  toLdap (attributes) {
    const hasAttributes = attributes && attributes.length
    const lcAttributes = hasAttributes ? attributes.map(attr => attr.toLowerCase()) : []
    const user = Object.entries(this.user).reduce((o, [userA, val]) => {
      const lcA = this.lcAttrFromUser(userA)
      if (hasAttributes && lcA !== 'cn' && !lcAttributes.includes(lcA)) {
        return o
      }
      if (lcA === 'objectguid') {
        val = toLdapBinaryUuid(val)
      } else if (GENERALIZED_TIME.includes(lcA)) {
        val = toLdapTimestamp(val)
      } else if (INTERVAL_TIME.includes(lcA)) {
        val = toLdapInterval(val)
      }
      const ldapA = this.ldapAttrFromLc(lcA)
      o[ldapA] = val
      return o
    }, {})

    if (lcAttributes.includes('samaccountname')) {
      user.sAMAccountName = user.cn
    }
    if (lcAttributes.includes('userprincipalname')) {
      user.userPrincipalName = `${user.cn}@${this.suffix.dc}`
    }

    // omit userpassword in LDAP response
    const { _id, userPassword, memberOf, ...attrs } = user
    const { cn } = user
    if (memberOf) {
      attrs.memberOf = memberOf.map(group => this.suffix.suffixRoles(group))
    }
    const ldap = {
      dn: this.suffix.suffixUsers(cn), // `cn=${username},${suffix}`,
      attributes: {
        cn: cn,
        ...attrs
      }
    }

    return ldap
  }
}

module.exports = {
  createLdapUserMap,
  LdapUserMapper,
  toLdapTimestamp,
  toLdapInterval,
  toLdapBinaryUuid
}

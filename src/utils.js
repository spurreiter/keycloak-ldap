
const crypto = require('crypto')

const uuid4 = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  )

/**
 * like lodash.get but simpler
 */
const get = (obj, keys = [], def) => {
  let o = obj
  if (typeof keys === 'string') keys = keys.split('.')
  for (const key of keys) {
    if (o && o[key]) { o = o[key] } else { return def }
  }
  return o
}

/**
 * splitFilter - componentize req.dn
 * @param  {String} [dn='']
 * @return {object}
 */
function splitFilter (dn = '') {
  const s = dn.split(/[()]/).reduce((o, part) => {
    if (o && /^[a-zA-Z]+=/.test(part)) {
      const [key, val] = part.split(/=/)
      if (o[key]) {
        if (!Array.isArray(o[key])) {
          o[key] = [o[key]]
        }
        o[key].push(val)
      } else {
        o[key] = val
      }
    }
    return o
  }, {})
  return s
}

/**
 * get username from common name
 * 'cn=jack,cn=Users,dc=example,dc=local' => jack
 * @param  {string} dn
 * @return {[type]}    [description]
 */
function getUsernameFromCn (dn) {
  const cn = dn.split(/\s*,\s*/)[0]
  const username = (cn.split(/=/) || [])[1]
  return username
}

/**
 * get username from req
 * @param  {LDAPRequest} req
 * @param  {String} [cn='cn']
 * @return {string}
 */
const getUsernameFromReq = (req, cn = 'cn') => get(req, ['dn', 'rdns', 0, 'attrs', cn, 'value'])

const toArray = str => Array.isArray(str) ? str : [str]

const toNumber = (num, def) => isNaN(num) ? def : Number(num)

/**
 * build distinguished name from dc, ou, and cn
 * commonName{ cn: ['Administrator', 'Users'], ou: 'Roles', dc: 'example.local' } =>
 * 'cn=Administrator,cn=Users,ou=Roles,dc=example,dc=local'
 * @param  {string[]|string} cn
 * @param  {string[]|string} ou
 * @param  {string} dc
 * @return {string}
 */
const distName = ({ cn, ou, dc }) => {
  const cns = cn && toArray(cn).map(part => `cn=${part}`)
  const ous = ou && toArray(ou).map(part => `ou=${part}`)
  const dcs = dc.split(/\./).map(part => `dc=${part}`)
  const name = [].concat(cns, ous, dcs).filter(Boolean).join(',')
  return name
}

/**
 * convert user to ldap object
 * @param  {object} user
 * @param  {Suffix} suffix
 * @return {object} ldap object
 */
function userToLdap (user, { suffix }) {
  const { _id, userpassword, memberOf, ...rest } = user
  const { username, objectguid } = user
  if (memberOf) {
    rest.memberOf = memberOf.map(group => suffix.suffixRoles(group))
  }
  const ldap = {
    dn: suffix.suffixUsers(username), // `cn=${username},${suffix}`,
    attributes: {
      // userpassword, // TODO: remove; is left in for debugging
      samaccountname: username,
      cn: username,
      ...rest,
      userid: objectguid
    }
  }
  return ldap
}

function roleToLdap (role, { suffix }) {
  const ldap = {
    dn: suffix.suffixRoles(role),
    attributes: {
      cn: role
    }
  }
  return ldap
}

/**
 * converts a uint16 low endian byte array to a string
 * @param  {[type]} arrUint8
 * @return {[type]}          [description]
 */
function decodeUTF16LE (arrUint8) {
  var cp = []
  for (var i = 0; i < arrUint8.length; i += 2) {
    cp.push(arrUint8[i] | (arrUint8[i + 1] << 8))
  }
  return String.fromCharCode.apply(String, cp)
}

/**
 * converts a uint16 low endian byte array to a string
 * val is quoted with double quotes (34, 0 == ")
 * @param  {Buffer|Uint8Array} val
 * @return {string}
 */
const unicodepwd = (val) => decodeUTF16LE(val.subarray(2, val.length - 2))

module.exports = {
  distName,
  get,
  splitFilter,
  getUsernameFromCn,
  getUsernameFromReq,
  unicodepwd,
  uuid4,
  userToLdap,
  roleToLdap,
  toNumber
}

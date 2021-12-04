const {
  distName
} = require('./utils.js')

/**
 * handle suffix for roles and users
 */
class Suffix {
  /**
   * @param {object} param0
   * @param {string} param0.cnUsers - Common name for users
   * @param {string} param0.ouRoles - Common name for roles
   * @param {string} param0.dc - domain component as domain name
   * @example
   * new Suffix({ cnUsers: 'Users', ouRoles: 'Roles', dc: 'example.local' })
   */
  constructor ({ cnUsers, ouRoles, dc }) {
    this.cnUsers = undefined
    this.ouRoles = undefined
    this.dc = undefined
    Object.assign(this, { cnUsers, ouRoles, dc })
  }

  /**
   * suffix for users
   * @param {string} [username]
   * @returns {string}
   * @example
   * suffix.suffixUsers() //> 'cn=Users,dc=example,dc=local'
   * suffix.suffixUsers('Andy') //> 'cn=Andy,cn=Users,dc=example,dc=local'
   */
  suffixUsers (username) {
    const { cnUsers, dc } = this
    const cn = (username ? [username] : []).concat(cnUsers)
    return distName({ cn, dc })
  }

  /**
   * suffix for roles
   * @param {string} [role]
   * @returns {string}
   * @example
   * suffix.suffixRoles() //> 'ou=Roles,dc=example,dc=local'
   * suffixRoles('test:read') //> 'cn=test:read,ou=Roles,dc=example,dc=local'
   */
  suffixRoles (role) {
    const { ouRoles, dc } = this
    const cn = role
    return distName({ cn, ou: ouRoles, dc })
  }
}

module.exports = {
  Suffix
}

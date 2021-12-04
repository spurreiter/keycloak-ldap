
const ldap = require('ldapjs')
const log = require('./log.js').log('ldapServer')
const {
  get,
  getUsernameFromCn,
  getUsernameFromReq,
  splitFilter,
  unicodepwd,
  // userToLdap,
  roleToLdap
} = require('./utils.js')
const { createLdapUserMap, LdapUserMapper } = require('./LdapUserMapper.js')
const { MSAD_ERR_INVALID_PASSWORD } = require('./constants.js')

/** @typedef {import('./Suffix').Suffix} Suffix */
/** @typedef {import('./adapter/index').IAdapter} Adapter */
/** @typedef {import('./types').LDAPRequest} LDAPRequest */
/** @typedef {import('./types').LDAPResult} LDAPResult */

/**
 * ldap Server
 * @param {object} param0
 * @param {string} param0.bindDN bind distinguished name (admin username)
 * @param {string} param0.bindPassword password of bind distinguished name
 * @param {Suffix} param0.suffix suffix for users and roles
 * @param {object} param0.mapper custom attribute mapper
 * @param {Adapter} adapter - data adapter
 * @return {any} ldap.createServer
 */
function ldapServer ({ bindDN, bindPassword, suffix, mapper }, adapter) {
  const suffixUsers = suffix.suffixUsers()
  const suffixRoles = suffix.suffixRoles()
  const ldapUserMap = createLdapUserMap({ suffix, mapper })

  // ---- middlewares ----

  /**
   * authorize middleware
   * @param {LDAPRequest} req
   * @param {LDAPResult} res
   * @param {Function} next
   */
  function authorizeMw (req, res, next) {
    let err
    // @ts-ignore
    if (!req.connection.ldap.bindDN.equals(bindDN)) {
      log.error('InsufficientAccessRightsError for %s', bindDN)
      err = new ldap.InsufficientAccessRightsError()
    }
    next(err)
  }

  /**
   * bind middleware
   * @param {LDAPRequest} req
   * @param {LDAPResult} res
   * @param {Function} next
   */
  function bindMw (req, res, next) {
    if (!req.dn.equals(bindDN) || req.credentials !== bindPassword) {
      log.error('InvalidCredentialsError for %s', req.dn.toString())
      const err = new ldap.InvalidCredentialsError()
      next(err)
    } else {
      res.end()
      next()
    }
  }

  /**
   * search middleware
   * @param {LDAPRequest} req
   * @param {LDAPResult} res
   * @param {Function} next
   */
  async function searchMw (req, res, next) {
    try {
      const dn = req.dn.toString()
      const filtered = splitFilter(req.filter.toString())
      const username = filtered.samaccountname || filtered.cn

      log.debug('searchMw', { dn, filtered, attributes: req.attributes, username })
      const attrUsername = ldapUserMap.mapper.cn

      if (username) {
        // search by username
        const user = await adapter.searchUsername(username)
        if (user) {
          log.info('searchMw user %s found', username)
          const ldapData = new LdapUserMapper(ldapUserMap, user).toLdap(req.attributes)
          log.debug(ldapData)
          res.send(ldapData)
        } else {
          log.warn('searchMw user %s not found', username)
        }
      } else if (filtered.mail) {
        // search by mail
        const user = await adapter.searchMail(filtered.mail)
        if (user && user[attrUsername]) {
          log.info('searchMw user %s found by email %s', user[attrUsername], filtered.mail)
          const ldapData = new LdapUserMapper(ldapUserMap, user).toLdap(req.attributes)
          log.debug(ldapData)
          res.send(ldapData)
        } else {
          log.warn('searchMw email %s not found', filtered.mail)
        }
      } else if (filtered.objectguid) {
        // search by objectguid
        const user = await adapter.searchGuid(filtered.objectguid)
        if (user && user[attrUsername]) {
          log.info(
            'searchMw user %s found by objectguid %s',
            user[attrUsername],
            filtered.mail
          )
          const ldapData = new LdapUserMapper(ldapUserMap, user).toLdap(req.attributes)
          log.debug(ldapData)
          res.send(ldapData)
        } else {
          log.warn('searchMw objectguid %s not found', filtered.mail)
        }
      } else if (filtered.sn) {
        // optional search by subjectname
        const users = await adapter.searchSn(filtered.sn)
        users.forEach((user) => {
          const ldapData = new LdapUserMapper(ldapUserMap, user).toLdap(req.attributes)
          log.debug(ldapData)
          res.send(ldapData)
        })
      } else if (filtered.objectclass === 'group') {
        // search by group
        log.debug('%j', req)
        const roles = await adapter.syncAllRoles()
        roles.forEach((role) => {
          const ldapData = roleToLdap(role, { suffix })
          log.debug(ldapData)
          res.send(ldapData)
        })
      } else if (username === '') {
        // NOOP
      } else {
        // synchronize all users
        const users = await adapter.syncAllUsers()
        users.forEach((user) => {
          res.send(user)
        })
      }

      res.end()
      next()
    } catch (e) {
      log.error('search error', e)
      next(e)
    }
  }

  /**
   * called when user tries to log in
   * @param {LDAPRequest} req
   * @param {LDAPResult} res
   * @param {Function} next
   */
  async function loginMw (req, res, next) {
    try {
      const dn = req.dn.toString()

      const username = getUsernameFromCn(dn)

      const isValid = await adapter.verifyPassword(username, req.credentials)

      if (!isValid) {
        log.error(`InvalidCredentialsError for ${username}`)
        next(new ldap.InvalidCredentialsError())
        return
      }

      res.end()
      next()
    } catch (e) {
      next(e)
    }
  }

  /**
   * update user attributes and password
   * @param {LDAPRequest} req
   * @param {LDAPResult} res
   * @param {Function} next
   */
  async function modifyMw (req, res, next) {
    let newPassword

    try {
      // log.debug('modifyMw %j %j', req.dn, req.changes)
      const username = getUsernameFromReq(req, 'cn') || getUsernameFromReq(req, 'samaccountname')

      if (!username) {
        log.error('NoSuchObjectError')
        const err = new ldap.NoSuchObjectError(req.dn.toString()) // TODO: change
        next(err)
        return
      }
      if (!req.changes.length) {
        log.error('ProtocolError')
        const err = new ldap.ProtocolError('changes required')
        next(err)
        return
      }

      let attributes = null

      for (let i = 0; i < req.changes.length; i++) {
        const mod = get(req, ['changes', i, 'modification'], {})
        const operation = get(req, ['changes', i, 'operation'])

        // log.debug(mod, operation, mod.vals, mod._vals)

        switch (operation) {
          case 'replace':
            if (mod.type === 'unicodepwd' && mod.vals && mod.vals.length) {
              newPassword = unicodepwd(mod._vals[0])
            } else if (mod.type === 'userpassword' && mod.vals && mod.vals.length) {
              newPassword = mod.vals[0]
            } else if (mod.type && mod.vals && mod.vals.length) {
              if (!attributes) attributes = {}
              const attr = mod.type
              const value = mod.vals[0]
              log.debug('replace %s %s', attr, value)
              if (attributes[attr] === undefined) {
                // keycloak shows a nasty behavior. If attributes are updated via account
                // then emailverified is set to false here to be immediately updated with
                // emailverified=true which is bad as we haven't verified the mail yet
                // therefore only the first update value for a given attribute is choosen
                attributes[attr] = value
              }
            } else {
              next(new ldap.UnwillingToPerformError('replace with missing value not allowed'))
              return
            }
            break
          case 'add':
          case 'delete':
            next(new ldap.UnwillingToPerformError('only replace allowed'))
            return
        }
      }

      if (newPassword) {
        log.info('updating password for user %s', username)
        await adapter.updatePassword(username, newPassword)
        newPassword = undefined
      }

      if (attributes) {
        log.info('updating attributes for user %s', username)
        const converted = new LdapUserMapper(ldapUserMap).update(attributes).get()
        await adapter.updateAttributes(username, converted)
      }

      res.end()
      next()
    } catch (/** @type {any} */ err) {
      const msg = (
        (newPassword)
          ? MSAD_ERR_INVALID_PASSWORD
          : 'attribute update failed'
      ) + err.message

      log.error('UnwillingToPerformError %s', msg)
      next(new ldap.UnwillingToPerformError(msg))
    }
  }

  /**
   * register new user middleware
   * @param {LDAPRequest} req
   * @param {LDAPResult} res
   * @param {Function} next
   */
  async function registerMw (req, res, next) {
    const dn = req.dn.toString()
    const attributes = req.toObject().attributes
    let username = (attributes.samaccountname || attributes.cn)
    if (Array.isArray(username)) {
      username = username[0]
    }

    log.debug('registerMw', { dn, attributes, username })

    const obj = await adapter.searchUsername(username)
    if (obj) {
      next(new ldap.EntryAlreadyExistsError(dn))
      return
    }
    try {
      await adapter.register(username)
      res.end()
      next()
      return
    } catch (e) {
      next(new ldap.EntryAlreadyExistsError(dn))
    }
  }

  /**
   * search for available roles middleware
   * @param {LDAPRequest} req
   * @param {LDAPResult} res
   * @param {Function} next
   */
  async function searchRolesMw (req, res, next) {
    const dn = req.dn.toString()
    const filtered = splitFilter(req.filter.toString())
    const cn = filtered.cn
    log.debug({ msg: 'searchRealmRoles', dn, filtered, attributes: req.attributes })
    const role = await adapter.searchRole(cn)
    if (role) {
      log.info('searchRolesMw role %s found', role)
      const ldapData = {
        dn: suffix.suffixRoles(),
        attributes: {
          cn
        }
      }
      res.send(ldapData)
    } else {
      log.warn('searchRolesMw role %s not found', filtered.cn)
    }
    res.end()
    next()
  }

  /**
   * modify roles middleware - TODO
   * @param {LDAPRequest} req
   * @param {LDAPResult} res
   * @param {Function} next
   */
  async function modifyRolesMw (req, res, next) {
    // TODO - check what needs to be done here
    log.debug('modifyRealmRoles dn %o', req.dn.toString())
    req.changes.forEach(function (c) {
      log.debug('  operation: ' + c.operation)
      log.debug('  modification: ' + c.modification.toString())
    })
    // return nothing...
    res.end()
    next()
  }

  // ----

  const server = ldap.createServer()

  server.bind(bindDN, bindMw)

  server.search(suffixUsers, authorizeMw, searchMw)

  server.bind(suffixUsers, loginMw)

  server.modify(suffixUsers, authorizeMw, modifyMw)

  server.add(suffixUsers, authorizeMw, registerMw)

  server.search(suffixRoles, authorizeMw, searchRolesMw)

  server.modify(suffixRoles, authorizeMw, modifyRolesMw)

  return server
}

module.exports = { ldapServer }

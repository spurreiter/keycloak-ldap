
const ldap = require('ldapjs')
const log = require('./log.js').log('ldapServer')
const { splitFilter, getUsernameFromCn, get, unicodepwd } = require('./utils.js')

const getUsername = (req, cn = 'cn') => get(req, ['dn', 'rdns', 0, 'attrs', cn, 'value'])

function ldapServer ({ bindDN, bindPassword, suffix }, adapter) {
  // ---- middlewares ----

  function authorizeMw (req, res, next) {
    let err
    if (!req.connection.ldap.bindDN.equals(bindDN)) {
      log('error: insufficient access rights')
      err = new ldap.InsufficientAccessRightsError()
    }
    next(err)
  }

  function bindMw (req, res, next) {
    if (!req.dn.equals(bindDN) || req.credentials !== bindPassword) {
      log(`error: invalid credentials for ${req.dn.toString()} using ${req.credentials}`)
      const err = new ldap.InvalidCredentialsError()
      next(err)
    } else {
      res.end()
      next()
    }
  }

  async function searchMw (req, res, next) {
    try {
      const dn = req.dn.toString()
      const filtered = splitFilter(req.filter.toString())
      const username = filtered.samaccountname || filtered.cn

      log({ msg: 'searchMw', dn, filtered, attributes: req.attributes, username })

      if (username) {
        const obj = await adapter.searchUsername(username)
        log(obj)
        if (obj) {
          res.send(obj)
        }
      } else if (filtered.mail) {
        const obj = await adapter.searchMail(filtered.mail)
        log(obj)
        if (obj) {
          res.send(obj)
        }
      } else if (filtered.objectclass === 'group') {
        // filtered: { objectclass: 'group' }
        // attributes: [ 'member', 'objectguid', 'cn', 'objectclass' ]
        console.log('%j', req)
        // TODO
        ;['test:read', 'test:write'].forEach(group => {
          res.send({
            dn: `cn=${group},${suffix}`,
            attributes: {
              cn: group
            }
          })
        })
      } else {
        const users = await adapter.syncAllUsers()
        users.forEach(user => {
          res.send(user)
        })
      }

      res.end()
      next()
    } catch (e) {
      console.log('search error', e)
      next(e)
    }
  }

  async function loginMw (req, res, next) {
    try {
      const dn = req.dn.toString()

      const username = getUsernameFromCn(dn)

      const isValid = await adapter.verifyPassword(username, req.credentials)

      if (!isValid) {
        log(`error: invalid credentials for ${username}`)
        next(new ldap.InvalidCredentialsError())
        return
      }

      res.end()
      next()
    } catch (e) {
      next(e)
    }
  }

  async function modifyMw (req, res, next) {
    try {
      log('modifyMw %j', req.dn)
      log('modifyMw %j', req.changes)

      const username = getUsername(req, 'cn') || getUsername(req, 'samaccountname')

      if (!username) {
        log('ERROR: NoSuchObjectError')
        const err = new ldap.NoSuchObjectError(req.dn.toString()) // TODO: change
        next(err)
        return
      }
      if (!req.changes.length) {
        log('ERROR: ProtocolError')
        const err = new ldap.ProtocolError('changes required')
        next(err)
        return
      }

      for (var i = 0; i < req.changes.length; i++) {
        const mod = get(req, ['changes', i, 'modification'], {})
        const operation = get(req, ['changes', i, 'operation'])

        log(mod, operation, mod.vals, mod._vals)

        switch (operation) {
          case 'replace':
            if (mod.type === 'unicodepwd' && mod.vals && mod.vals.length) {
              const newPassword = unicodepwd(mod._vals[0])
              await adapter.updatePassword(username, newPassword)
            } else if (mod.type === 'userpassword' && mod.vals && mod.vals.length) {
              const newPassword = mod.vals[0]
              await adapter.updatePassword(username, newPassword)
            } else if (mod.type && mod.vals && mod.vals.length) {
              await adapter.updateAttribute(username, mod.type, mod.vals[0])
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

      res.end()
      next()
    } catch (err) {
      log('ERROR: OperationsError %s', err)
      next(new ldap.OperationsError('password reset failed'))
    }
  }

  async function registerMw (req, res, next) {
    const dn = req.dn.toString()
    const attributes = req.toObject().attributes
    let username = (attributes.samaccountname || attributes.cn)
    if (Array.isArray(username)) {
      username = username[0]
    }

    log({ msg: 'registerMw', dn, attributes, username })

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

  // ----

  const server = ldap.createServer()

  server.bind(bindDN, bindMw)

  server.search(suffix, authorizeMw, searchMw)

  server.search('ou=RealmRoles,dc=example,dc=local', authorizeMw, (req, res, next) => {
    const dn = req.dn.toString()
    const filtered = splitFilter(req.filter.toString())
    const cn = filtered.cn
    log({ msg: 'searchMw', dn, filtered, attributes: req.attributes })
    res.send({
      dn: 'ou=RealmRoles,dc=example,dc=local',
      attributes: {
        cn
      }
    })
    res.end()
    next()
  })
  server.modify('ou=RealmRoles,dc=example,dc=local', authorizeMw, (req, res, next) => {
    log('ou dn %o', req.dn.toString())
    req.changes.forEach(function (c) {
      log('  operation: ' + c.operation)
      log('  modification: ' + c.modification.toString())
    })
    res.end()
    next()
  })

  server.bind(suffix, loginMw)

  server.modify(suffix, authorizeMw, modifyMw)

  server.add(suffix, authorizeMw, registerMw)

  return server
}

module.exports = { ldapServer }

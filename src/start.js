const http = require('http')
// @ts-ignore
const express = require('express')
const basicAuth = require('express-basic-auth')
const log = require('./log.js').log('')

const {
  ldapServer,
  Suffix,
  mfaRouter,
  MockAdapter
} = require('./index.js')
const {
  DAY_IN_MS
} = require('./constants.js')
const config = require('./config.js')

const SIGNALS = ['SIGHUP', 'SIGINT', 'SIGTERM']

const {
  dc,
  cnUsers,
  ouRoles,
  port,
  host,
  bindDN,
  bindPassword,
  httpPort,
  httpHost
} = config

if (!bindPassword) {
  log.fatal('Define password with BIND_PWD')
  process.exit(1)
}

const suffix = new Suffix({ cnUsers, ouRoles, dc })
const ldapConfig = {
  port,
  host,
  bindDN: suffix.suffixUsers(bindDN),
  bindPassword: bindPassword,
  maxPwdAge: 90 * DAY_IN_MS,
  suffix,
  mapper: {} // uses attributeMapper from LdapUserMapper.js
}
const httpConfig = {
  port: httpPort,
  host: httpHost,
  basicAuthUsers: {}
}

if (module === require.main) {
  require('../scripts/client.js')
  require('../scripts/mail-server.js')

  const adapter = new MockAdapter(ldapConfig)

  // --- ldap ----

  const server = ldapServer(ldapConfig, adapter)

  server.listen(ldapConfig.port, ldapConfig.host, () => {
    const host = server.address().address
    const port = server.address().port
    log.info('LDAP on ldap://%s:%s', host, port)
  })

  // ---- mfa ----

  const sendMfa = (body) => console.log(body)
  const app = express()
  if (Object.keys(httpConfig.basicAuthUsers).length) {
    app.use(basicAuth({ users: httpConfig.basicAuthUsers }))
  }
  // a very simple logger
  // @ts-ignore
  app.use((req, res, next) => {
    let text = ''
    req.on('data', chunk => {
      text += chunk.toString()
    })
    req.on('end', () => {
      const { method, url, headers } = req
      log.debug({ method, url, headers, text })
    })
    next()
  })
  // mount router
  app.use('/mfa', mfaRouter({ adapter, sendMfa }))
  // final error handlers
  // @ts-ignore
  app.use((req, res, next) => {
    const err = new Error('' + 404)
    // @ts-ignore
    err.status = 404
    next(err)
  })
  app.use((err, req, res, next) => {
    const status = err.status || 500
    res.status(status).json({ status })
  })

  const httpServer = http.createServer(app)
  httpServer.listen(httpConfig.port, httpConfig.host, (err) => {
    if (err) {
      log.error(err)
      process.exit(1)
    }
    // @ts-ignore
    const host = httpServer.address().address
    // @ts-ignore
    const port = httpServer.address().port
    log.info('HTTP on http://%s:%s', host, port)
  })

  // --- shutdown ---

  SIGNALS.forEach(ev => process.on(ev, () => {
    log.info('LDAP closing on %s', ev)
    server.close()
    httpServer.close()
    setTimeout(() => { process.exit(1) }, 300)
  }))
}

const http = require('http')
const express = require('express')
const basicAuth = require('express-basic-auth')
const log = require('./log.js').log('dev')

const {
  ldapServer,
  Suffix,
  mfaRouter,
  MockAdapter
} = require('./index.js')

if (module === require.main) {
  require('../scripts/client.js')
  require('../scripts/mail-server.js')

  const dc = 'example.local' // domain name
  const cnUsers = 'Users' // users common name
  const ouRoles = 'RealmRoles' // roles
  const suffix = new Suffix({ cnUsers, ouRoles, dc })

  const config = {
    ldap: {
      port: 1389,
      host: '127.0.0.1',
      bindDN: suffix.suffixUsers('Administrator'),
      bindPassword: 'ldap-password',
      suffix
    },
    http: {
      port: 1080,
      host: '127.0.0.1',
      basicAuthUsers: {}
    }
  }

  log.debug(config)
  const adapter = new MockAdapter(config.ldap)

  // --- ldap ----

  const server = ldapServer(config.ldap, adapter)

  server.listen(config.ldap.port, config.ldap.host, () => {
    var host = server.address().address
    var port = server.address().port
    log.info('LDAP on ldap://%s:%s', host, port)
  })

  // ---- mfa ----

  const sendMfa = (body) => console.log(body)
  const app = express()
  if (Object.keys(config.http.basicAuthUsers).length) {
    app.use(basicAuth({ users: config.http.basicAuthUsers }))
  }
  // a very simple logger
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
  app.use((req, res, next) => {
    const err = new Error(404)
    err.status = 404
    next(err)
  })
  app.use((err, req, res, next) => {
    const status = err.status || 500
    res.status(status).json({ status })
  })

  const httpServer = http.createServer(app)
  httpServer.listen(config.http.port, config.http.host, () => {
    var host = httpServer.address().address
    var port = httpServer.address().port
    log.info('HTTP on http://%s:%s', host, port)
  })
}

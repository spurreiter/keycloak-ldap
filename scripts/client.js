#!/usr/bin/env node

// @ts-nocheck

/**
 * express application with keycloak authentication
 */

const express = require('express')
const session = require('express-session')
const Keycloak = require('keycloak-connect')

const log = console.log

function setup () {
  const app = express()

  const realm = 'my'
  const clientId = 'my-server'
  const clientSecret = undefined
  const authServerUrl = 'http://localhost:8080/auth'
  const scope = 'openid profile email phone'

  const memoryStore = new session.MemoryStore()
  const keycloak = new Keycloak({
    store: memoryStore,
    scope
  }, {
    realm,
    clientId,
    secret: clientSecret,
    public: !clientSecret,
    authServerUrl
  })

  app.use(logger)

  app.get('/', (req, res) => {
    res.end(render(req))
  })

  app.use(
    session({
      secret: 'mySecret',
      resave: false,
      saveUninitialized: true,
      store: memoryStore
    }),
    keycloak.middleware({
      logout: '/logout',
      admin: '/admin',
      protected: '/protected/resource'
    })
  )

  app.get('/login', keycloak.protect(), function (req, res) {
    res.end(render(req))
  })

  return app
}

function logger (req, res, next) {
  let body = ''
  req.on('data', chunk => { body += chunk.toString() })
  res.once('finish', () => {
    const { method, url } = req
    log('%s %s %s %s', res.statusCode, method, url, body)
  })
  next()
}

const stringify = obj => JSON.stringify(obj, null, 2)

function decodeJWT (token) {
  const toJSON = str => {
    const o = JSON.parse(Buffer.from(str, 'base64').toString())
    if (o.iat) o.iat = new Date(o.iat * 1000).toString()
    if (o.exp) o.exp = new Date(o.exp * 1000).toString()
    return o
  }
  try {
    const [header, payload] = token.split('.')
    return stringify({
      header: toJSON(header),
      payload: toJSON(payload)
    })
  } catch (e) {}
}

function render (req) {
  const tokens = JSON.parse((req.session && req.session['keycloak-token']) || '{}')

  return view({
    accessToken: decodeJWT(tokens.access_token),
    refreshToken: decodeJWT(tokens.refresh_token),
    idToken: decodeJWT(tokens.id_token),
    result: stringify(tokens)
  })
}

const view = ({
  accessToken,
  refreshToken,
  idToken,
  result
}) => `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Client</title>
    <style media="screen">
      body { font-family: sans-serif; }
      pre { white-space: pre-wrap; word-break: break-all; }
    </style>
  </head>
  <body>
    <nav>
      <ul>
        <li><a href="/login">login</a></li>
        <li><a href="/logout">logout</a></li>
      </ul>
    </nav>
    <div class="content">
      <h2>access_token</h2>
      <pre>${accessToken || ''}</pre>

      <h2>refresh_token</h2>
      <pre>${refreshToken || ''}</pre>

      <h2>id_token</h2>
      <pre>${idToken || ''}</pre>

      <h2>result</h2>
      <pre>${result || ''}</pre>
    </div>
  </body>
</html>
`

const config = {
  host: 'localhost',
  port: 4000
}
const app = setup()
const server = app.listen(config.port, config.host, () => {
  const host = server.address().address
  const port = server.address().port
  console.log('Client on http://%s:%s', host, port)
})

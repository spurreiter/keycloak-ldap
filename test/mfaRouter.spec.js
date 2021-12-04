const assert = require('assert')
const request = require('supertest')
const express = require('express')
const { mfaRouter, MockAdapter } = require('../src/index.js')

const app = () => {
  const app = express()
  const adapter = new MockAdapter({})
  const sendMfa = body => { app._test = body }
  app.use('/mfa', mfaRouter({ adapter, sendMfa }))
  return app
}

describe('mfaRouter', function () {
  const email = 'alice@local.me'
  const nonce = '99c95442-525c-4a40-a30a-087a1ff67dfe'
  let _app
  const cache = {}

  before(function () {
    _app = app()
  })

  const send = (o) => request(_app)
    .post('/mfa')
    .set({ 'X-Request-Id': '1234567890' })
    .type('json')
    .send(o)
  const verify = (o) => request(_app)
    .put('/mfa')
    .set({ 'X-Request-Id': '1234567890' })
    .type('json')
    .send(o)

  it('shall send mfa code', function () {
    return send({
      email,
      language: 'en',
      nonce
    })
      .expect(201, {
        destination: email,
        nonce
      })
      .then(() => {
        // check what's sent via sendMfa
        const { code, ...other } = _app._test
        cache.code = code
        assert.deepStrictEqual(other, {
          email,
          language: 'en',
          destination: email,
          nonce
        })
      })
  })

  it('shall reject verify mfa code', function () {
    return verify({
      email,
      code: '#112233',
      nonce
    })
      // .then(console.log)
      .expect(403, { requestId: '1234567890', error: 'mfa_invalid', status: 403 })
  })

  it('shall verify mfa code', function () {
    return verify({
      email,
      code: cache.code,
      nonce
    })
      // .then(console.log)
      .expect(200, { nonce })
  })

  it('shall fail on missing nonce', function () {
    return verify({
      email,
      code: cache.code
    })
      .expect(400, {
        error: 'Nonce missing',
        requestId: '1234567890',
        status: 400
      })
  })

  it('shall reject further verify', function () {
    return verify({
      email,
      code: cache.code,
      nonce
    })
      .expect(404)
      .then(({ body, status }) => {
        assert.deepStrictEqual(body, { requestId: '1234567890', status: 404, error: 'invalid_id' })
      })
  })

  it('shall reject if verify is called before initialize', async function () {
    const email = 'charly@charm'
    const code = '1234'
    await verify({ email, code, nonce }).expect(404, {
      error: 'invalid_id',
      requestId: '1234567890',
      status: 404
    })
  })

  it('shall reject if verify is called without code', async function () {
    const email = 'charly@charm'
    await verify({ email, nonce }).expect(404, {
      error: 'invalid_id',
      requestId: '1234567890',
      status: 404
    })
  })

  it('shall reject after max verifies', async function () {
    const email = 'charly@charm'
    const code = '1234'
    await send({ email }).expect(201)
    await verify({ email, code, nonce }).expect(403)
    await verify({ email, code, nonce }).expect(403)
    await verify({ email, code, nonce }).expect(403, {
      error: 'max_verified',
      requestId: '1234567890',
      status: 403
    })
  })

  it('shall reject after max retries', async function () {
    const email = 'bob@builder'
    await send({ email }).expect(201)
    await send({ email }).expect(200)
    await send({ email }).expect(200)
    await send({ email }).expect(400, {
      error: 'max_retries',
      requestId: '1234567890',
      status: 400
    })
  })
})

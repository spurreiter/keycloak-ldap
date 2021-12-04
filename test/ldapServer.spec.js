const assert = require('assert')
const ldap = require('ldapjs')
const log = require('../src/log.js').log('test')
const {
  ldapServer,
  Suffix,
  MockAdapter
} = require('../src/index.js')

const createLdapServer = (config) => {
  const {
    dc,
    cnUsers,
    ouRoles,
    port,
    host,
    bindDN,
    bindPassword
  } = config

  const suffix = new Suffix({ cnUsers, ouRoles, dc })
  const ldapConfig = {
    port,
    host,
    bindDN: suffix.suffixUsers(bindDN),
    bindPassword: bindPassword,
    suffix,
    mapper: {} // uses attributeMapper from LdapUserMapper.js
  }
  const adapter = new MockAdapter(ldapConfig)

  const server = ldapServer(ldapConfig, adapter)
  server.listen(config.port, config.host, () => {
    const { address, port } = server.address()
    log.info('LDAP on ldap://%s:%s', address, port)
  })
  return server
}

describe('ldapServer', function () {
  let ldapServer
  let client

  const port = 13891
  const bindDN = 'Administrator'
  const bindPassword = 'ldap-password'
  const dn = 'cn=Users,dc=example,dc=local'
  const user = 'alice'
  const password = 'alice'

  const onError = (type) => (err) => err ? console.error(type, err) : undefined

  before(function () {
    ldapServer = createLdapServer({
      dc: 'example.local',
      cnUsers: 'Users', // users common name
      ouRoles: 'RealmRoles', // roles
      port,
      host: '127.0.0.1',
      bindDN,
      bindPassword
    })
  })
  after(function () {
    ldapServer.close()
  })

  before(function () {
    client = ldap.createClient({
      url: [`ldap://127.0.0.1:${port}`]
    })
    client.on('error', onError('error'))
    client.bind(`cn=${bindDN},${dn}`, bindPassword, onError('bind'))
  })

  it('shall login user for user', function (done) {
    client.bind(`cn=${user},${dn}`, password, (err) => {
      // console.error(err)
      assert.strictEqual(err, null)
      done()
    })
  })

  it('shall return InvalidCredentialsError if login fails', function (done) {
    client.bind(`cn=${user},${dn}`, '', (err) => {
      // console.error(err)
      assert.strictEqual(err.name, 'InvalidCredentialsError')
      assert.strictEqual(err.message, 'InvalidCredentialsError')
      done()
    })
  })
})

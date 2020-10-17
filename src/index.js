const { Adapter } = require('./adapter/index.js')
const { ldapServer } = require('./ldapServer.js')

module.exports = {
  ldapServer
}

if (module === require.main) {
  const config = {
    port: 1389,
    bindDN: 'cn=Administrator,cn=Users,dc=example,dc=local',
    bindPassword: 'ldap-password',
    suffix: 'cn=Users,dc=example,dc=local'
  }

  const adapter = new Adapter(config)

  const server = ldapServer(config, adapter)

  server.listen(config.port, () => {
    console.log(`Running on ${config.port}`)
  })
}

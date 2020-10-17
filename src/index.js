const { Adapter } = require('./adapter/index.js')
const { ldapServer } = require('./ldapServer.js')

module.exports = {
  ldapServer
}

if (module === require.main) {
  require('../scripts/client.js')
  require('../scripts/mail-server.js')

  const config = {
    port: 1389,
    bindDN: 'cn=Administrator,cn=Users,dc=example,dc=local',
    bindPassword: 'ldap-password',
    suffix: 'cn=Users,dc=example,dc=local'
  }

  const adapter = new Adapter(config)

  const server = ldapServer(config, adapter)

  server.listen(config.port, () => {
    var host = server.address().address
    var port = server.address().port
    console.log('LDAP on ldap://%s:%s', host, port)
  })
}

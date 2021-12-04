const dotenv = require('dotenv')
dotenv.config()

const toNumber = (val, def) => isNaN(Number(val)) ? def : Number(val)

const {
  DC: dc = 'example.local', // domain name
  CN_USERS: cnUsers = 'Users', // users common name
  OU_ROLES: ouRoles = 'RealmRoles', // roles
  PORT: port,
  HOST: host = '0.0.0.0',
  BIND_DN: bindDN = 'Administrator',
  BIND_PWD: bindPassword = 'ldap-password',
  HTTP_PORT: httpPort,
  HTTP_HOST: httpHost = '127.0.0.1'
} = process.env

const config = {
  dc,
  cnUsers,
  ouRoles,
  port: toNumber(port, 1389),
  host,
  bindDN,
  bindPassword,
  httpPort: toNumber(httpPort, 1080),
  httpHost
}

module.exports = config

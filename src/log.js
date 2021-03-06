const debugLevel = require('debug-level')

const log = (name, opts) => debugLevel.log(`keycloak-ldap:${name}`, opts)

module.exports = { log }

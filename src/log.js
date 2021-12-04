const debugLevel = require('debug-level')

const namespace = val => ['keycloak-ldap', val].filter(Boolean).join(':')

const log = (name, opts) => debugLevel.log(namespace(name), opts)

module.exports = { log }

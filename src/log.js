const debug = require('debug')

const log = name => debug(`@my/keycloak-ldap:${name}`)

module.exports = { log }

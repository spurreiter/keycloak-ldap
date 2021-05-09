const {
  KEYCLOAK_VERSION = '13.0.0',
  KEYCLOAK_USER,
  KEYCLOAK_PASSWORD
} = process.env

const config = {
  keycloakVersion: KEYCLOAK_VERSION,
  image: 'keycloak-ldap',
  baseUrl: 'http://localhost:8080/auth',
  realm: 'my',
  // Keycloak admin user and password - !!! CHANGE THIS !!!
  username: KEYCLOAK_USER || 'admin',
  password: KEYCLOAK_PASSWORD || 'admin',
  email: 'admin@my.local'
}

module.exports = config

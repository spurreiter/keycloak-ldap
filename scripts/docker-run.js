#!/usr/bin/env node

const { execSync } = require('child_process')
const config = require('./config.js')
const execOpts = { stdio: 'inherit' }

// @see https://registry.hub.docker.com/r/jboss/keycloak
async function dockerRun () {
  execSync([
    'docker run -d',
    '--name keycloak',
    '-h keycloak',
    `-e KEYCLOAK_USER=${config.username}`,
    `-e KEYCLOAK_PASSWORD=${config.password}`,
    // '-e KEYCLOAK_IMPORT=/tmp/my-realm.json',
    // `-v ${__dirname}/my-realm.json:/tmp/my-realm.json`,
    '-p 8080:8080',
    `my/keycloak:${config.keycloakVersion}`
  ].join(' '), execOpts)
}

dockerRun()

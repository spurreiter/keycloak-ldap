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
    '-e KEYCLOAK_IMPORT=/tmp/my-realm.json',
    `-v ${__dirname}/my-realm.json:/tmp/my-realm.json`,
    // '-p 8080:8080',
    '--network host', // needed for linux
    `my/keycloak:${config.keycloakVersion}`,
    '/opt/jboss/tools/docker-entrypoint.sh -c standalone.xml -b 127.0.0.1' // needed for linux
  ].join(' '), execOpts)
}

dockerRun()

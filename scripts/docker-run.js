#!/usr/bin/env node

const os = require('os')
const fs = require('fs')
const { execSync } = require('child_process')
const config = require('./config.js')
const execOpts = { stdio: 'inherit' }

function rewriteRealmForDarwin () {
  const filename = `${__dirname}/my-realm.json`
  const realm = require(filename)
  realm.components['org.keycloak.storage.UserStorageProvider'][0].config.connectionUrl[0] = 'ldap://host.internal.docker:1389'
  fs.writeFileSync(filename, JSON.stringify(realm, null, 2), 'utf8')
}

// @see https://registry.hub.docker.com/r/jboss/keycloak
async function dockerRun () {
  let cmd = [
    'docker run -d',
    '--name keycloak',
    '-h keycloak',
    `-e KEYCLOAK_USER=${config.username}`,
    `-e KEYCLOAK_PASSWORD=${config.password}`,
    '-e KEYCLOAK_IMPORT=/tmp/my-realm.json',
    `-v ${__dirname}/my-realm.json:/tmp/my-realm.json`
  ]

  if (os.platform() === 'darwin') {
    rewriteRealmForDarwin()
    cmd = cmd.concat([
      '-p 8080:8080',
      `my/keycloak:${config.keycloakVersion}`,
      '/opt/jboss/tools/docker-entrypoint.sh -b 0.0.0.0'
    ])
  } else {
    cmd = cmd.concat([
      '--network host', // needed for linux
      `my/keycloak:${config.keycloakVersion}`,
      '/opt/jboss/tools/docker-entrypoint.sh -c standalone.xml -b 127.0.0.1' // needed for linux
    ])
  }

  execSync(cmd.join(' '), execOpts)
}

dockerRun()

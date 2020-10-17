#!/usr/bin/env node

const fs = require('fs')
const { execSync } = require('child_process')
const { keycloakVersion } = require('./config.js')
const execOpts = { stdio: 'inherit' }

// remove annoying entrypoint
const dockerfile = `
FROM jboss/keycloak:${keycloakVersion}

ENTRYPOINT []

CMD ["/opt/jboss/tools/docker-entrypoint.sh", "-b", "0.0.0.0"]
`

async function dockerBuild () {
  const filename = `${__dirname}/Dockerfile`
  fs.writeFileSync(filename, dockerfile, 'utf8')
  execSync([
    'docker build',
    `-f ${filename}`,
    `-t my/keycloak:${keycloakVersion}`,
    '.'
  ].join(' '), execOpts)
  fs.unlinkSync(filename)
}

dockerBuild()

#!/usr/bin/env node

const fs = require('fs')
const { execSync } = require('child_process')
const execOpts = { stdio: 'inherit' }
const config = require('./config.js')

// remove annoying entrypoint
const dockerfile = `
FROM jboss/keycloak:${config.keycloakVersion}

ENTRYPOINT []

CMD ["/opt/jboss/tools/docker-entrypoint.sh", "-b", "0.0.0.0"]
`

async function dockerBuild () {
  const filename = `${__dirname}/Dockerfile`
  fs.writeFileSync(filename, dockerfile, 'utf8')
  execSync([
    'docker build',
    `-f ${filename}`,
    `-t ${config.image}:${config.keycloakVersion}`,
    '.'
  ].join(' '), execOpts)
  fs.unlinkSync(filename)
}

dockerBuild()

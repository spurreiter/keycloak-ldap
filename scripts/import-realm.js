#!/usr/bin/env node

/**
 * script to setup realm
 */

const KcAdmin = require('keycloak-admin').default
const config = require('./config.js')
const realmCnf = require('./realm.js')

const log = console.log

// authenticate as admin user
async function client (config) {
  const { username, password, baseUrl } = config
  const kc = new KcAdmin({
    baseUrl,
    realmName: 'master'
  })
  await kc.auth({
    username,
    password,
    grantType: 'password',
    clientId: 'admin-cli'
  })
  return kc
}

// set admin attributes
async function setAdmin (kc, adminUser) {
  const { username } = adminUser
  const users = await kc.users.find({ realm: 'master', username })
  // console.log(users)
  const id = users[0].id

  await kc.users.update(
    { id },
    adminUser
  )
  log('INFO: admin user updated')
}

// import local users
async function importUsers (kc, users, { realm }) {
  const currentUsers = await kc.users.find({ realm })
  const importUsernames = users.map(user => user.username)
  for (const user of currentUsers) {
    if (importUsernames.includes(user.username)) {
      // console.log(user)
      await kc.users.del({ realm, id: user.id })
    }
  }

  for (const user of users) {
    const { id } = await kc.users.create({ ...user, realm })
    await kc.users.resetPassword({
      id,
      realm,
      credential: {
        temporary: false,
        type: 'password',
        value: user.username // password is same as username
      }
    })
    log(`INFO: user "${user.username}" password "${user.username}" created`)
  }
}

// create realm
async function createRealm (kc, realmObj, { realm }) {
  const found = await kc.realms.findOne({ realm })
  // console.log('%o', found)
  if (!found) {
    await kc.realms.create({ ...realmObj, realm })
    log(`INFO: realm ${realm} created`)
  }
}

// set client scopes for that realm
async function createClientScopes (kc, clientScopes, { realm }) {
  for (const clientScope of clientScopes) {
    const { name } = clientScope
    let scope = await kc.clientScopes.findOneByName({ realm, name })
    // console.log('%o', scope)
    if (!scope) {
      scope = await kc.clientScopes.create({ ...clientScope, realm })
      log(`INFO: clientScope ${name} created`)
    }
  }
}

// set clients for that realm
async function createClients (kc, clients, { realm }) {
  for (const client of clients) {
    const { clientId } = client
    const found = await kc.clients.find({ realm, clientId })
    // console.log('%o', found)
    if (!found || !found.length) {
      await kc.clients.create({ ...client, realm })
      log(`INFO: client ${clientId} created`)
    }
  }
}

// set user federation
async function createUserFederation (kc, components, { realm }) {
  // const found = await kc.components.find({ realm })
  // console.log('%o', found)
  // return

  let id

  for (let component of components) {
    if (typeof component === 'function') {
      component = component(id)
    }
    const { name } = component
    const found = await kc.components.find({ realm, name })
    // console.log('%o', found)
    log('INFO: %s %s', name, (found && found.length))
    if (!found || !found.length) {
      const created = await kc.components.create({ ...component, realm })
        .catch((err) => console.error('ERROR: %s', err.message))
      // console.log('%o', created)
      if (name === 'my-ldap') {
        id = created.id
      }
    } else if (name === 'my-ldap') {
      id = found[0].id
    }
  }
}

async function main () {
  const { realm } = config
  const kc = await client(config)
  await setAdmin(kc, realmCnf.adminUser)
  await createRealm(kc, realmCnf.realmObj, { realm })
  try {
    // can't import users for that realm if user federation is set
    await importUsers(kc, realmCnf.users, { realm })
  } catch (e) {}
  await createClientScopes(kc, realmCnf.clientScopes, { realm })
  await createClients(kc, realmCnf.clients, { realm })
  await createUserFederation(kc, realmCnf.components, { realm })
}

main().catch(console.error)

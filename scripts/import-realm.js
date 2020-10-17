#!/usr/bin/env node

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
async function createRealm (kc, { realm }) {
  const found = kc.realms.findOne({ realm })
  if (!found) {
    await kc.realms.create({ id: realm, realm })
    log(`INFO: realm ${realm} created`)
  }
}

// set client scopes for that realm
async function createClientScopes (kc, clientScopes, { realm }) {
  for (const clientScope of clientScopes) {
    const { name } = clientScope
    let scope = await kc.clientScopes.findOneByName({ realm, name })
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
  for (const component of components) {
    const { name } = component
    const found = await kc.components.find({ realm, name })
    // console.log('%o', found)
    console.log('%s %s', name, (found && found.length))
    if (!found || !found.length) {
      const created = await kc.components.create({ ...component, realm }).catch(() => {})
      console.log('%o', created)
    }
  }
}

async function main () {
  const { realm } = config
  const kc = await client(config)
  await setAdmin(kc, realmCnf.adminUser)
  try {
    // can't import users for that realm if user federation is set
    await importUsers(kc, realmCnf.users, { realm })
  } catch (e) {}
  await createRealm(kc, { realm })
  await createClientScopes(kc, realmCnf.clientScopes, { realm })
  await createClients(kc, realmCnf.clients, { realm })
  await createUserFederation(kc, realmCnf.components, { realm })
}

main().catch(console.error)

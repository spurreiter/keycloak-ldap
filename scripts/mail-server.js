const { simpleParser } = require('mailparser')
const { SMTPServer } = require('smtp-server')

const debug = require('debug')

// logger with levels
const log = (function log () {
  const MAXLEVEL = 'ERROR'
  let isMaxLevel = false
  const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG']
  levels.forEach(level => {
    const lc = level.toLowerCase()
    log[lc] = !isMaxLevel
      ? debug(`@my/paperbox:${level}`)
      : () => {}
    isMaxLevel = isMaxLevel || level === MAXLEVEL
  })
  return log
})()

function authorizeUser (auth, session, callback) {
  var err = null
  var result = null
  if (auth.username in this.options.users) {
    const { uid, password } = this.options.users[auth.username]
    if (auth.method === 'CRAM-MD5') {
      if (auth.validatePassword(password)) {
        result = { user: uid }
      }
    } else if (auth.method === 'PLAIN') {
      if (password === auth.password) {
        result = { user: uid }
      }
    } else if (auth.method === 'LOGIN') {
      if (password === auth.password) {
        result = { user: uid }
      }
    }
  } else {
    result = { user: 65536 } // nobody
  }
  if (!result) {
    err = new Error('Invalid username or password')
  }
  callback(err, result)
}

function Paperbox (options) {
  this.options = {
    smtpPort: 1025,
    users: {
      guest: { password: 'password', uid: 65535 },
      nobody: { password: null, uid: 65536 }
    }
  }
  Object.assign(this.options, options)
}

Paperbox.prototype.listen = function () {
  const smtpOptions = {
    banner: 'mail server for testing',
    authOptional: true,
    maxAllowedUnauthenticatedCommands: 100,
    logger: log,
    authMethods: ['CRAM-MD5', 'PLAIN', 'LOGIN'],
    onData: processMailData.bind(this),
    onAuth: authorizeUser.bind(this),
    onRcptTo: validateRcptTo.bind(this),
    disabledCommands: ['STARTTLS']
  }
  const smtpServer = new SMTPServer(smtpOptions)
  smtpServer.listen(this.options.smtpPort)
  log.info('server started ... ')
}

Paperbox.prototype.addMTAFields = function (mail) {
  var now = new Date()
  mail.received = now
}

Paperbox.prototype.onMailSaved = function (err, mailId) {
  if (err) {
    log.error('ERROR: failed saving mail:', err)
  } else {
    log.debug('mail saved, id:', mailId)
  }
}

async function processMailData (stream, session, callback) {
  log.debug('processMailData() - start')
  log.debug('  session = ', session)
  var mboxes = session.envelope.rcptTo.map(function (x) { return x.address })
  const parsed = await simpleParser(stream)
  this.addMTAFields(parsed)
  for (var i = 0; i < mboxes.length; i++) {
    log.info('save mail to [' + mboxes[i] + ']')
    console.log(mboxes[i], parsed)
  }
  callback()
  log.debug('processMailData() - done')
}

function validateRcptTo (address, session, callback) {
  log.debug(`validateRcptTo(${address.address}, ${address.args}) ... OK`)
  callback()
}

const server = new Paperbox()
server.listen()
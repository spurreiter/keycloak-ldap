const { Router } = require('express')
const bodyParser = require('body-parser')

const log = require('../log.js').log('mfaRouter')
const { IAdapter } = require('../adapter/index.js') // eslint-disable-line no-unused-vars
const { MfaCode } = require('./MfaCode.js')

/**
 * send a mfa code
 * shall throw an error of type {@link MfaCodeError}
 * ```
 * ({ [email|phoneNumber]: string,
 *    code: string,      // mfa code
 *    ...other: any[]    // other properties
 * }) => void
 * ```
 * @callback SendMfaFunction
 * @param {object} param0
 * @return {void}
 */

/**
 * express router to manage mfa codes
 * @param {object} param0
 * @param {IAdapter} param0.adapter - database adapter
 * @param {SendMfaFunction} param0.sendMfa - service to send Mfa
 * @param {String} [param0.idProp=phoneNumber] - req.body property which serves as id to store the mfa token
 * @param {String} [param0.idPropAlt=email] - req.body property which serves as alertnative id to store the mfa token
 * @returns
 */
function mfaRouter ({ adapter, sendMfa, idProp = 'phoneNumber', idPropAlt = 'email' }) {
  const router = new Router()

  const mfaCode = new MfaCode()

  const getDestination = body => {
    const { [idProp]: id, [idPropAlt]: altId } = body
    return id || altId
  }

  router.use(bodyParser.json())

  router.post('/', async (req, res, next) => {
    const { nonce } = req.body
    const destination = getDestination(req.body)

    try {
      const mfaDb = await adapter.searchMfa(destination)
      const [err, mfa] = mfaCode.create(destination, mfaDb)
      await adapter.upsertMfa(mfa)
      if (err) {
        next(err)
        return
      }
      await sendMfa({ ...req.body, destination, code: mfa.code })
      const status = mfa.retryCount ? 200 : 201
      res.status(status).json({ nonce, destination })
    } catch (err) {
      next(wrapErrorStatus(err, 400))
    }
  })

  router.put('/verify', async (req, res, next) => {
    const destination = getDestination(req.body)
    const { code, nonce } = req.body

    // the nonce shall prevent accidental misconfiguration
    // it needs to be checked at the client as well.
    if (!nonce || !nonce.length) {
      next(new Error('Nonce missing'))
      return
    }

    try {
      const mfaDb = await adapter.searchMfa(destination)
      const [err, mfa] = mfaCode.verify(destination, mfaDb, code)
      if (!mfa) {
        await adapter.removeMfa(destination)
      } else {
        await adapter.upsertMfa(mfa)
      }
      if (err) {
        next(err)
        return
      }
      res.status(200).json({ nonce })
    } catch (err) {
      next(err)
    }
  })

  router.use((err, req, res, _next) => {
    const requestId = req.headers['x-request-id']
    const status = err.status || 500
    const destination = getDestination(req.body)
    const message = status < 500 ? err.message : 'server_error'

    log.error({ msg: err.message, destination, status, requestId, err })
    res.status(status).json({
      requestId,
      error: message,
      status
    })
  })

  return router
}

module.exports = {
  mfaRouter
}

function wrapErrorStatus (err, status = 400) {
  if (!err.status) {
    err.status = status
  }
  return err
}

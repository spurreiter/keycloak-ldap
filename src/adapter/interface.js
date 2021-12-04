/**
 * defines adapter interface
 */
class IAdapter {
  /**
   * search user by username
   * @param  {string|undefined} username
   * @return {Promise<object|undefined>} return found user object (undefined if nothing was found)
   */
  async searchUsername (username) {
    throw new Error()
  }

  /**
   * search user by mail address
   * @param  {string|undefined}  mail
   * @return {Promise<object|undefined>} return found user object (undefined if nothing was found)
   */
  async searchMail (mail) {
    throw new Error()
  }

  /**
   * search user by guid
   * @param  {string|undefined}  guid
   * @return {Promise<object|undefined>} return found user object (undefined if nothing was found)
   */
  async searchGuid (guid) {
    throw new Error()
  }

  /**
   * search for role
   * @param  {string}  role
   * @return {Promise<object|undefined>} return found roles object (undefined if nothing was found)
   */
  async searchRole (role) {
    throw new Error()
  }

  /**
   * search by sn
   * @param {string} sn
   * @return { Promise < object | undefined >} return found object matching sn
   */
  async searchSn (sn) {
    throw new Error()
  }

  /**
   * synchronize all users
   * @optional
   * @return {Promise<object[]>} all user objects
   */
  async syncAllUsers () {
    throw new Error()
  }

  /**
   * synchronize all roles
   * Returns a list of roles supported by adapter
   * For user registration make sure to include
   * - offline_access
   * - uma_authorization
   * @return {Promise<string[]>} - array of roles
   */
  async syncAllRoles () {
    throw new Error()
  }

  /**
   * verify password for username
   * @param  {string}  username
   * @param  {string}  password
   * @return {Promise<boolean>} true if password is valid
   */
  async verifyPassword (username, password) {
    throw new Error()
  }

  /**
   * update password for username
   * @param  {string}  username
   * @param  {string}  newPassword
   * @return {Promise}
   */
  async updatePassword (username, newPassword) {
    throw new Error()
  }

  /**
   * updates user attributes
   * attribute keys arrive in lowercase from keycloak
   * @param {string} username
   * @param {object} attributes
   * @return {Promise}
   */
  async updateAttributes (username, attributes) {
    throw new Error()
  }

  /**
   * register new user with username
   * @param  {string|undefined}  username
   * @return {Promise}
   */
  async register (username) {
    throw new Error()
  }

  /**
   * insert or update mfa code into db
   * @param {object} mfa
   * @returns {Promise}
   */
  async upsertMfa (mfa) {
    throw new Error()
  }

  /**
   * search for mfa code by recipient
   * @param {string} recipient
   * @returns {Promise}
   */
  async searchMfa (recipient) {
    throw new Error()
  }

  /**
   * delete mfa code by recipient
   * @param {string} recipient
   * @returns {Promise}
   */
  async removeMfa (recipient) {
    throw new Error()
  }
}

module.exports = { IAdapter }

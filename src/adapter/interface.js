
/**
 * defines adapter interface
 */
class IAdapter {
  /**
   * search user by username
   * @param  {String}  username
   * @return {Promise<object|undefined>} return found user object (undefined if nothing was found)
   */
  async searchUsername (username) {
    throw new Error()
  }

  /**
   * search user by mail address
   * @param  {String}  mail
   * @return {Promise<object|undefined>} return found user object (undefined if nothing was found)
   */
  async searchMail (mail) {
    throw new Error()
  }

  /**
   * search for role
   * @param  {String}  role
   * @return {Promise<object|undefined>} return found roles object (undefined if nothing was found)
   */
  async searchRole (role) {
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
   * @param  {String}  username
   * @param  {String}  password
   * @return {Promise<boolean>} true if password is valid
   */
  async verifyPassword (username, password) {
    throw new Error()
  }

  /**
   * update password for username
   * @param  {String}  username
   * @param  {String}  newPassword
   * @return {Promise}
   */
  async updatePassword (username, newPassword) {
    throw new Error()
  }

  /**
   * updates user attributes
   * attribute keys arrive in lowercase from keycloak
   * @param {String} username
   * @param {object} attributes
   * @return {Promise}
   */
  async updateAttributes (username, attributes) {
    throw new Error()
  }

  /**
   * register new user with username
   * @param  {String}  username
   * @return {Promise}
   */
  async register (username) {
    throw new Error()
  }

  /**
   * insert or update mfa code into db
   * @param {MfaCodeEntity} mfa
   */
  async upsertMfa (mfa) {
    throw new Error()
  }

  /**
   * search for mfa code by recipient
   * @param {String} recipient
   */
  async searchMfa (recipient) {
    throw new Error()
  }

  /**
   * delete mfa code by recipient
   * @param {String} recipient
   */
  async removeMfa (recipient) {
    throw new Error()
  }
}

module.exports = { IAdapter }

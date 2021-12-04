/**
 * defines adapter interface
 */
export class IAdapter {
    /**
     * search user by username
     * @param  {string|undefined} username
     * @return {Promise<object|undefined>} return found user object (undefined if nothing was found)
     */
    searchUsername(username: string | undefined): Promise<object | undefined>;
    /**
     * search user by mail address
     * @param  {string|undefined}  mail
     * @return {Promise<object|undefined>} return found user object (undefined if nothing was found)
     */
    searchMail(mail: string | undefined): Promise<object | undefined>;
    /**
     * search user by guid
     * @param  {string|undefined}  guid
     * @return {Promise<object|undefined>} return found user object (undefined if nothing was found)
     */
    searchGuid(guid: string | undefined): Promise<object | undefined>;
    /**
     * search for role
     * @param  {string}  role
     * @return {Promise<object|undefined>} return found roles object (undefined if nothing was found)
     */
    searchRole(role: string): Promise<object | undefined>;
    /**
     * search by sn
     * @param {string} sn
     * @return { Promise < object | undefined >} return found object matching sn
     */
    searchSn(sn: string): Promise<object | undefined>;
    /**
     * synchronize all users
     * @optional
     * @return {Promise<object[]>} all user objects
     */
    syncAllUsers(): Promise<object[]>;
    /**
     * synchronize all roles
     * Returns a list of roles supported by adapter
     * For user registration make sure to include
     * - offline_access
     * - uma_authorization
     * @return {Promise<string[]>} - array of roles
     */
    syncAllRoles(): Promise<string[]>;
    /**
     * verify password for username
     * @param  {string}  username
     * @param  {string}  password
     * @return {Promise<boolean>} true if password is valid
     */
    verifyPassword(username: string, password: string): Promise<boolean>;
    /**
     * update password for username
     * @param  {string}  username
     * @param  {string}  newPassword
     * @return {Promise}
     */
    updatePassword(username: string, newPassword: string): Promise<any>;
    /**
     * updates user attributes
     * attribute keys arrive in lowercase from keycloak
     * @param {string} username
     * @param {object} attributes
     * @return {Promise}
     */
    updateAttributes(username: string, attributes: object): Promise<any>;
    /**
     * register new user with username
     * @param  {string|undefined}  username
     * @return {Promise}
     */
    register(username: string | undefined): Promise<any>;
    /**
     * insert or update mfa code into db
     * @param {object} mfa
     * @returns {Promise}
     */
    upsertMfa(mfa: object): Promise<any>;
    /**
     * search for mfa code by recipient
     * @param {string} recipient
     * @returns {Promise}
     */
    searchMfa(recipient: string): Promise<any>;
    /**
     * delete mfa code by recipient
     * @param {string} recipient
     * @returns {Promise}
     */
    removeMfa(recipient: string): Promise<any>;
}

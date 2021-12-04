/**
 * FIXME: custom LDAP mapping is not yet considered
 */
export class Account {
    /**
     * @param {object} opts
     * @param {number} [opts.maxPwdAge] max password age in milliSecs. Default is 90 days.
     */
    constructor(opts?: {
        maxPwdAge?: number | undefined;
    });
    maxPwdAge: number;
    /**
     * @param {object} user
     * @returns {boolean} true if expired
     */
    isExpired(user: object): boolean;
    /**
     * checks if password reset is needed and sets user attributes
     * @param {object} user
     * @returns {object} user
     */
    passwordResetNeeded(user: object): object;
    /**
     * sets a new password
     * @param {object} user
     * @returns {object} user
     */
    setPassword(user: object, password: any): object;
    /**
     * password is valid, resets badPwdCount and sets lastLoginAt
     * @param {object} user
     * @returns {object} user
     */
    passwordValid(user: object): object;
    /**
     * password is invalid, increments badPwdCount
     * @param {object} user
     * @returns {object} user
     */
    passwordInValid(user: object): object;
    register(username: any): {
        objectGUID: string;
        whenCreated: number;
        userAccountControl: number;
        pwdLastSet: number;
        username: any;
    };
}

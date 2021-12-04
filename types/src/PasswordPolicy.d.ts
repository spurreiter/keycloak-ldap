export type Policy = import('./types').Policy;
export class PasswordPolicy {
    /**
     * @constructor
     * @param {Policy} policy
     */
    constructor(policy: Policy);
    policy: {
        minLength?: number | undefined;
        maxLength?: number | undefined;
        minDigits?: number | undefined;
        minLowerChars?: number | undefined;
        minUpperChars?: number | undefined;
        minSpecialChars?: number | undefined;
        notUsername?: boolean | undefined;
        notEmail?: boolean | undefined;
        notPhone?: boolean | undefined;
    };
    /**
     * validate password
     * @param {string} password
     * @param {object} param1
     * @param {string} [param1.username]
     * @param {string} [param1.email]
     * @param {string} [param1.phone]
     * @returns {null|TypeError} if null then password is valid according to policy
     */
    validate(password?: string, { username, email, phone }?: {
        username?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    }): null | TypeError;
}

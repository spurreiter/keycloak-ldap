export type MfaCodeEntity = import('../types').MfaCodeEntity;
/**
 * Type of mfa code
 */
export type TypeEnum = number;
export class MfaCode {
    /**
     * @constructor
     * @param {object} [param0]
     * @param {number} [param0.validMins=5]
     * @param {number} [param0.length=6]
     * @param {TypeEnum} [param0.type=NUMERIC]
     * @param {number} [param0.maxRetryCount=2]
     * @param {number} [param0.maxVerifyCount=2]
     */
    constructor({ validMins, length, type, maxRetryCount, maxVerifyCount }?: {
        validMins?: number | undefined;
        length?: number | undefined;
        type?: number | undefined;
        maxRetryCount?: number | undefined;
        maxVerifyCount?: number | undefined;
    } | undefined);
    validMsecs: number;
    length: number;
    type: number;
    maxRetryCount: number;
    maxVerifyCount: number;
    /**
     * create a token
     * @throws {MfaCodeError}
     * @param {string} id - use email or phoneNumber
     * @param {object} [mfa]
     * @param {number} [mfa.retryCount=0]
     * @return {[err: MfaCodeError|null, entity: MfaCodeEntity|null]}
     */
    create(id: string, mfa?: {
        retryCount?: number | undefined;
    } | undefined): [err: MfaCodeError | null, entity: import("../types").MfaCodeEntity | null];
    /**
     * verify stored code against userinput
     * @throws {MfaCodeError}
     * @param {String} id
     * @param {MfaCodeEntity} mfa - persisted mfaCode (from db)
     * @param {String} value - value (from user input)
     * @return {[err: MfaCodeError|null, entity: MfaCodeEntity|null]}
     */
    verify(id: string, mfa: MfaCodeEntity, value: string): [err: MfaCodeError | null, entity: import("../types").MfaCodeEntity | null];
}
export class MfaCodeError extends Error {
    /**
     * Set error
     * @param {String} message
     * @param {Number} [status=400]
     */
    constructor(message: string, status?: number | undefined);
    status: number;
}
/**
 * create a mfa code
 * @param {Number} [length=6] (int) length of code
 * @param {TypeEnum} [type=NUMERIC] type of code
 * @returns {String}
 */
export function createCode(length?: number | undefined, type?: number | undefined): string;
/**
 * verify mfa code
 * @param {string} code - original (persisted) code
 * @param {string} value - value (from user input)
 * @returns {boolean} true if valid
 */
export function verifyCode(code: string, value: string): boolean;
export declare const NUMERIC: number;
export declare const ALPHANUMERIC: number;
export declare const ALPHANUMERICUPPER: number;

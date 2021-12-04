/**
 * send a mfa code
 * shall throw an error of type {@link MfaCodeError }
 * ```
 * ({ [email|phoneNumber]: string,
 *    code: string,      // mfa code
 *    ...other: any[]    // other properties
 * }) => void
 * ```
 */
export type SendMfaFunction = (param0: object) => void;
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
 * @param {String} [param0.idProp=mobile] - req.body property which serves as id to store the mfa token
 * @param {String} [param0.idPropAlt=email] - req.body property which serves as alternative id to store the mfa token
 * @returns
 */
export function mfaRouter({ adapter, sendMfa, idProp, idPropAlt }: {
    adapter: IAdapter;
    sendMfa: SendMfaFunction;
    idProp?: string | undefined;
    idPropAlt?: string | undefined;
}): import("express-serve-static-core").Router;
import { IAdapter } from "../adapter/index.js";

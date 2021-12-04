import {SearchRequest, LDAPResult as Result, Change } from 'ldapjs'

export class LDAPRequest extends SearchRequest {
  dn: {
    equals: Function
  };
  credentials: string;
  changes: Change[];
  toObject: () => {
    attributes: {
      samaccountname?: string;
      cn?: string;
    }
  };
}

export class LDAPResult extends Result {
  end (): void;
  send (ldap: object): void;
}

export interface MfaCodeEntity {
  /** use email or phoneNumber as unique-id */
  id: string;
  code?: string;
  /** timestamp in milliseconds */
  expiresAt: number;
  retryCount: number;
  verifyCount:number;
}

export interface Policy {
  /** min password length @default 8 */
  minLength?: number;
  /** max password length @default 40 */
  maxLength?: number;
  /** min digits @default 1 */
  minDigits?: number;
  /** min lower case chars @default 1 */
  minLowerChars?: number;
  /** min upper case chars @default 1 */
  minUpperChars?: number;
  /** min special chars @default 1 */
  minSpecialChars?: number;
  /** does not contain username @default true */
  notUsername?: boolean;
  /** does not contain email @default true */
  notEmail?: boolean;
  /** does not contain phone number @default true */
  notPhone?: boolean;
}

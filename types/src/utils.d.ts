export type Suffix = import('./Suffix').Suffix;
export type LDAPRequest = import('./types').LDAPRequest;
export type LDAPResult = import('./types').LDAPResult;
/**
 * build distinguished name from dc, ou, and cn
 * commonName{ cn: ['Administrator', 'Users'], ou: 'Roles', dc: 'example.local' } =>
 * 'cn=Administrator,cn=Users,ou=Roles,dc=example,dc=local'
 * @param  {object} param0
 * @param  {string[]|string} [param0.cn]
 * @param  {string[]|string} [param0.ou]
 * @param  {string} param0.dc
 * @return {string}
 */
export function distName({ cn, ou, dc }: {
    cn?: string | string[] | undefined;
    ou?: string | string[] | undefined;
    dc: string;
}): string;
/**
 * like lodash.get but simpler
 * @param {object} obj
 * @param {string|(string|number)[]} keys
 * @param {any} [def]
 * @returns {any}
 */
export function get(obj: object, keys?: string | (string | number)[], def?: any): any;
/**
 * splitFilter - componentize req.dn
 * @param  {String} [dn='']
 * @return {object}
 */
export function splitFilter(dn?: string | undefined): object;
/**
 * get username from common name
 * 'cn=jack,cn=Users,dc=example,dc=local' => jack
 * @param  {string} dn
 * @return {string} username
 */
export function getUsernameFromCn(dn: string): string;
/**
 * get username from req
 * @param  {LDAPRequest} req
 * @param  {String} [cn='cn']
 * @return {string}
 */
export function getUsernameFromReq(req: LDAPRequest, cn?: string | undefined): string;
/**
 * converts a uint16 low endian byte array to a string
 * val is quoted with double quotes (34, 0 == ")
 * @param  {Buffer|Uint8Array} val
 * @return {string}
 */
export function unicodepwd(val: Buffer | Uint8Array): string;
/** @typedef {import('./Suffix').Suffix} Suffix */
/** @typedef {import('./types').LDAPRequest} LDAPRequest */
/** @typedef {import('./types').LDAPResult} LDAPResult */
/**
 * @returns {string}
 */
export function uuid4(): string;
/**
 * convert user to ldap object
 * @param  {object} user
 * @param  {object} param1
 * @param  {Suffix} param1.suffix
 * @return {object} ldap object
 */
export function userToLdap(user: object, { suffix }: {
    suffix: Suffix;
}): object;
/**
 * convert role to ldap object
 * @param  {string} role
 * @param  {object} param1
 * @param  {Suffix} param1.suffix
 * @return {object} ldap object
 */
export function roleToLdap(role: string, { suffix }: {
    suffix: Suffix;
}): object;
export function toNumber(num: any, def: any): any;

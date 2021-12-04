export type Suffix = import('./Suffix').Suffix;
export type Adapter = import('./adapter/index').IAdapter;
export type LDAPRequest = import('./types').LDAPRequest;
export type LDAPResult = import('./types').LDAPResult;
/** @typedef {import('./Suffix').Suffix} Suffix */
/** @typedef {import('./adapter/index').IAdapter} Adapter */
/** @typedef {import('./types').LDAPRequest} LDAPRequest */
/** @typedef {import('./types').LDAPResult} LDAPResult */
/**
 * ldap Server
 * @param {object} param0
 * @param {string} param0.bindDN bind distinguished name (admin username)
 * @param {string} param0.bindPassword password of bind distinguished name
 * @param {Suffix} param0.suffix suffix for users and roles
 * @param {object} param0.mapper custom attribute mapper
 * @param {Adapter} adapter - data adapter
 * @return {any} ldap.createServer
 */
export function ldapServer({ bindDN, bindPassword, suffix, mapper }: {
    bindDN: string;
    bindPassword: string;
    suffix: Suffix;
    mapper: object;
}, adapter: Adapter): any;

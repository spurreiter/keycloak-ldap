export type LdapUserMap = {
    /**
     * user and roles suffix instance
     */
    suffix: Suffix;
    /**
     * attribute mapper for storage
     */
    mapper: object;
    /**
     * attribute mapper for LDAP proto
     */
    mapperToLdap: object;
};
export type Suffix = import('./Suffix').Suffix;
/**
 * @typedef {object} LdapUserMap
 * @property {Suffix} suffix user and roles suffix instance
 * @property {object} mapper attribute mapper for storage
 * @property {object} mapperToLdap attribute mapper for LDAP proto
 */
/**
 * create ldap user map
 * @param {object} param0
 * @param {Suffix} param0.suffix instance of Suffix
 * @param {object} param0.mapper custom mapper object
 * @return {LdapUserMap}
 */
export function createLdapUserMap({ suffix, mapper }: {
    suffix: Suffix;
    mapper: object;
}): LdapUserMap;
/**
 * map user attributes to ldap attributes
 */
export class LdapUserMapper {
    /**
     * @constructor
     * @throws {TypeError} if user is not an object
     * @param {LdapUserMap} ldapUserMap result from createLdapUserMap()
     * @param {object} [user] user object
     */
    constructor(ldapUserMap: LdapUserMap, user?: object);
    mapper: any;
    mapperToLdap: any;
    suffix: any;
    /**
     * @private
     */
    private _checkType;
    /**
     * get user object for storage in database
     * @return {object} user object
     */
    get(): object;
    /**
     * set user from database
     * @throws {TypeError}
     * @param {object} user
     * @returns {this}
     */
    set(user: object): this;
    user: any;
    /**
     * update ldap attributes
     * @param {object} ldapAttributes
     * @param {boolean} [ignoreReadonly] - do not filter readonly values
     * @return {this}
     */
    update(ldapAttributes: object, ignoreReadonly?: boolean | undefined): this;
    /**
     * get ldap user object
     * @param {string[]} attributes - required attributes
     * @return {object} mapped ldap object
     */
    toLdap(attributes: string[]): object;
}
/**
 * @see https://www.epochconverter.com/ldap
 * @param {Date|string|number} date
 * @return {string|undefined}
 */
export function toLdapTimestamp(date: Date | string | number): string | undefined;
export function toLdapInterval(date: any): number | undefined;
export function toLdapBinaryUuid(uuid: any): Buffer;

/**
 * handle suffix for roles and users
 */
export class Suffix {
    /**
     * @param {object} param0
     * @param {string} param0.cnUsers - Common name for users
     * @param {string} param0.ouRoles - Common name for roles
     * @param {string} param0.dc - domain component as domain name
     * @example
     * new Suffix({ cnUsers: 'Users', ouRoles: 'Roles', dc: 'example.local' })
     */
    constructor({ cnUsers, ouRoles, dc }: {
        cnUsers: string;
        ouRoles: string;
        dc: string;
    });
    cnUsers: any;
    ouRoles: any;
    dc: any;
    /**
     * suffix for users
     * @param {string} [username]
     * @returns {string}
     * @example
     * suffix.suffixUsers() //> 'cn=Users,dc=example,dc=local'
     * suffix.suffixUsers('Andy') //> 'cn=Andy,cn=Users,dc=example,dc=local'
     */
    suffixUsers(username?: string | undefined): string;
    /**
     * suffix for roles
     * @param {string} [role]
     * @returns {string}
     * @example
     * suffix.suffixRoles() //> 'ou=Roles,dc=example,dc=local'
     * suffixRoles('test:read') //> 'cn=test:read,ou=Roles,dc=example,dc=local'
     */
    suffixRoles(role?: string | undefined): string;
}

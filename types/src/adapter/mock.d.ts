export class MockAdapter extends IAdapter {
    constructor(opts: any);
    _account: Account;
    _users: MockDataStore;
    _roles: string[];
    _policy: PasswordPolicy;
    _mfa: MockDataStore;
    checkUser(user: any): any;
}
import { IAdapter } from "./interface.js";
import { Account } from "../Account.js";
declare class MockDataStore {
    constructor(opts: any);
    data: any;
    insert(items: any): Promise<any>;
    update(query: any, item: any): Promise<any>;
    upsert(query: any, item: any): Promise<any>;
    find(query: any): Promise<any>;
    findOne(query: any): Promise<any>;
    remove(query: any): Promise<any>;
}
import { PasswordPolicy } from "../PasswordPolicy.js";
export {};

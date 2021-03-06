keycloak/federation/ldap/src/main/java/org/keycloak/storage/ldap/LDAPStorageProvider.java

line ~205

```java
switch (editMode) {
    case READ_ONLY:
        if (model.isImportEnabled()) {
            proxied = new ReadonlyLDAPUserModelDelegate(local);
        } else {
            proxied = new ReadOnlyUserModelDelegate(local);
        }
        break;
    case WRITABLE:
    case UNSYNCED:
        // Any attempt to write data, which are not supported by the LDAP schema, should fail
        // This check is skipped when register new user as there are many "generic" attributes always written (EG. enabled, emailVerified) and those are usually unsupported by LDAP schema
>>>comment out here and recompile
        // if (!model.isImportEnabled() && !newUser) {
        //     UserModel readOnlyDelegate = new ReadOnlyUserModelDelegate(local, ModelException::new);
        //     proxied = new LDAPWritesOnlyUserModelDelegate(readOnlyDelegate, this);
        // }
        break;
}
```

Need to uncomment...

https://infinispan.org/docs/stable/titles/configuring/configuring.html#persistence

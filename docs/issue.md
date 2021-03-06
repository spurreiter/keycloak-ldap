https://issues.redhat.com/browse/KEYCLOAK-16327

Email verification fails if user federation ldap "Import Users" is OFF

Steps to verify:

1. Keycloak with User Federation LDAP
   User "alice" has email and emailverified=false attributes set
2. User Federation -> ldap -> Settings
	 - Import Users: ON
3. User Federation -> ldap -> Mappers
 	 - "user-attribute-ldap-mapper" emailVerified with "LDAP Attribute=emailverified" mapped to "User Model Attribute=emailVerified"
4. User "alice" can login after email verification.
5. User Federation -> ldap -> Settings
	 - Import Users: OFF
	 - Button: Remove Imported
6. User "alice" can not start email verification.
	 but emailverified attribute is writable

I am using Keycloak with a LDAP server.
I like to store emailverified attribute after email verification in the LDAP server.
If the user is imported and managed by keycloak all is fine.
As soon as "Import Users" is set to OFF the following exceptionis thrown.

```
15:22:08,699 ERROR [org.keycloak.services.error.KeycloakErrorHandler] (default task-30) Uncaught server error: org.keycloak.models.ModelException: Not possible to write 'required action VERIFY_EMAIL' when updating user 'alice'
	at org.keycloak.keycloak-server-spi-private@11.0.3//org.keycloak.models.utils.ReadOnlyUserModelDelegate.readOnlyException(ReadOnlyUserModelDelegate.java:146)
	at org.keycloak.keycloak-server-spi-private@11.0.3//org.keycloak.models.utils.ReadOnlyUserModelDelegate.addRequiredAction(ReadOnlyUserModelDelegate.java:71)
	at org.keycloak.keycloak-server-spi@11.0.3//org.keycloak.models.utils.UserModelDelegate.addRequiredAction(UserModelDelegate.java:104)
	at org.keycloak.keycloak-ldap-federation@11.0.3//org.keycloak.storage.ldap.LDAPWritesOnlyUserModelDelegate.addRequiredAction(LDAPWritesOnlyUserModelDelegate.java:86)
	at org.keycloak.keycloak-server-spi@11.0.3//org.keycloak.models.utils.UserModelDelegate.addRequiredAction(UserModelDelegate.java:104)
```

Am I doing something wrong here or is updating the attribute using the "user-attribute-ldap-mapper" simply not supported?
Any help is appreciated.

# connect with openldap

docker-compose -f docker-compose-openldap.yml up

https://localhost:6443 

Login as cn=admin,dc=example,dc=org

Create "Generic: Posix Group" group

Create a child entry "Generic: User Account" alice

cn=alice,cn=Users,dc=example,dc=org
First name	Alice	
Last name	Adams	
Common Name	alice	
User ID	alice	
Password	****************	
UID Number	1000	
GID Number	500	
Home directory	/home/users/alice	
objectClass	inetOrgPerson posixAccount

Add new attribute 

Email alice@my.local
roomNumber true





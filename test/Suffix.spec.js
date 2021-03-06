const assert = require('assert')
const { Suffix } = require('../src/Suffix.js')

describe('Suffix', function () {
  before(function () {
    this.suffix = new Suffix({ cnUsers: 'Users', ouRoles: 'Roles', dc: 'example.local' })
  })
  it('shall get suffixUsers', function () {
    assert.strictEqual(this.suffix.suffixUsers(), 'cn=Users,dc=example,dc=local')
  })
  it('shall get suffixUsers for username Andy', function () {
    assert.strictEqual(this.suffix.suffixUsers('Andy'), 'cn=Andy,cn=Users,dc=example,dc=local')
  })
  it('shall get suffixRoles', function () {
    assert.strictEqual(this.suffix.suffixRoles(), 'ou=Roles,dc=example,dc=local')
  })
  it('shall get suffixRoles for role test:read', function () {
    assert.strictEqual(this.suffix.suffixRoles('test:read'), 'cn=test:read,ou=Roles,dc=example,dc=local')
  })
})

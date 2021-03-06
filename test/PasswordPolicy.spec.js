const assert = require('assert')
const { PasswordPolicy } = require('../src/PasswordPolicy.js')

describe('PasswordPolicy', function () {
  const policy = new PasswordPolicy()

  it('empty password', function () {
    const r = policy.validate()
    assert.strictEqual(r.message, 'invalidPasswordMinLength')
  })
  it('too short', function () {
    const r = policy.validate('test')
    assert.strictEqual(r.message, 'invalidPasswordMinLength')
  })
  it('too long', function () {
    const r = policy.validate('$1A aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa')
    assert.strictEqual(r.message, 'invalidPasswordMaxLength')
  })
  it('no digits', function () {
    const r = policy.validate('$Aaaaaaaaaa')
    assert.strictEqual(r.message, 'invalidPasswordMinDigits')
  })
  it('no lower chars', function () {
    const r = policy.validate('$1AAAAAAAAA')
    assert.strictEqual(r.message, 'invalidPasswordMinLowerChars')
  })
  it('no upper chars', function () {
    const r = policy.validate('$1aaaaaaaaa')
    assert.strictEqual(r.message, 'invalidPasswordMinUpperChars')
  })
  it('no special chars', function () {
    const r = policy.validate('1Aaaaaaaaa')
    assert.strictEqual(r.message, 'invalidPasswordMinSpecialChars')
  })
  it('shall not contain username', function () {
    const r = policy.validate('$1AaaaaaBobaaa', { username: 'Bob' })
    assert.strictEqual(r.message, 'invalidPasswordNotUsername')
  })
  it('shall not contain username', function () {
    const r = policy.validate('$1Aaaaaabob@Email.xaaa', { username: 'Bob', email: 'boB@email.x' })
    assert.strictEqual(r.message, 'invalidPasswordNotEmail')
  })
  it('shall not contain phone number', function () {
    const r = policy.validate('$1Aaaaaa12c3456aaa', { username: 'Bob', email: 'bob@email.x', phone: '+123456' })
    assert.strictEqual(r.message, 'invalidPasswordNotPhone')
  })
})

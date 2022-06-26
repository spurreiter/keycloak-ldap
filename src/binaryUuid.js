
const POS = [3, 2, 1, 0, 5, 4, 7, 6]

function toLdapBinaryUuid (uuid) {
  const hex = String(uuid).replace(/-/g, '')
  if (hex.length !== 32) {
    throw new Error('not a uuid')
  }
  const a = new Array(16)
  for (let i = 0; i < 16; i++) {
    const n = parseInt(hex.substr(i * 2, 2), 16)
    const p = POS[i] ?? i
    a[p] = n
  }
  const buf = Buffer.from(a)
  return buf
}

const strToBuf = str => {
  const arr = String(str).split('\\').map(v => parseInt(v, 16))
  arr.shift()
  return Buffer.from(arr)
}

function binaryUuidToString (buf) {
  if (typeof buf === 'string') {
    // hack: some ldap connectors send the uuid as plain text
    if (!/^[\\]/.test(buf) && buf.length === 36) return buf
    buf = strToBuf(buf)
  }
  const arr = []
  for (let i = 0; i < 16; i++) {
    const p = POS[i] ?? i
    const n = buf[p]
    arr.push(n.toString(16))
    if ([3, 5, 7, 9].includes(i)) {
      arr.push('-')
    }
  }
  return arr.join('')
}

module.exports = {
  toLdapBinaryUuid,
  binaryUuidToString
}

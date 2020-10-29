
const crypto = require('crypto')

const uuid4 = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  )

function splitFilter (dn = '') {
  const s = dn.split(/[()]/).reduce((o, part) => {
    if (o && /^[a-zA-Z]+=/.test(part)) {
      const [key, val] = part.split(/=/)
      if (o[key]) {
        if (!Array.isArray(o[key])) {
          o[key] = [o[key]]
        }
        o[key].push(val)
      } else {
        o[key] = val
      }
    }
    return o
  }, {})
  return s
}

function getUsernameFromCn (dn) {
  const cn = dn.split(/\s*,\s*/)[0]
  const username = (cn.split(/=/) || [])[1]
  return username
}

const get = (obj, keys = [], def) => {
  let o = obj
  if (typeof keys === 'string') keys = keys.split('.')
  for (const key of keys) {
    if (o && o[key]) { o = o[key] } else { return def }
  }
  return o
}

function decodeUTF16LE (arrUint8) {
  var cp = []
  for (var i = 0; i < arrUint8.length; i += 2) {
    cp.push(arrUint8[i] | (arrUint8[i + 1] << 8))
  }
  return String.fromCharCode.apply(String, cp)
}

const unicodepwd = (val) => decodeUTF16LE(val.subarray(2, val.length - 2))

module.exports = {
  get,
  splitFilter,
  getUsernameFromCn,
  unicodepwd,
  uuid4
}

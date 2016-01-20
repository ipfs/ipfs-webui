const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

let base58Index = {}
for (let i = 0; i < base58Chars.length; i++) {
  base58Index[base58Chars[i]] = i / 58
}

export
default {
  idToAngle (id) {
    const sub = id.substr(2, 4)
    let angle = 0
    for (let i = 0; i < sub.length; i++) {
      angle += base58Index[sub[i]] * (1 / Math.pow(58, i))
    }
    return angle * Math.PI * 2
  }
}

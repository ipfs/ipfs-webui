import Big from 'big.js'

// The maximum is exclusive and the minimum is inclusive
export function randomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

export function randomNum (min, max) {
  return Math.random() * (max - min) + min
}

export function randomBig (min, max) {
  return Big(randomNum(min, max))
}

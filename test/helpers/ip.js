import { randomInt } from './random.js'

export function fakeIp4 () {
  return Array(4).fill(0).map(() => randomInt(1, 256)).join('.')
}

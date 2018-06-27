import { randomBig } from './random'

export function fakeBandwidth () {
  const rb = () => randomBig(0, Number.MAX_VALUE)
  return { totalIn: rb(), totalOut: rb(), rateIn: rb(), rateOut: rb() }
}

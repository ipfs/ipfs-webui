/* global it, expect */
import { isSource } from 'is-pull-stream'

function expectRightFormat (output) {
  expect(Array.isArray(output)).toBe(true)

  for (const stream of output) {
    expect(Object.keys(stream).length).toBe(3)
    expect(isSource(stream.content)).toBe(true)
    expect(stream.path).toBeTruthy()
    expect(stream.size).not.toBeNaN()
  }
}

function expectRightOutput (output, expected) {
  expect(output.length).toBe(expected.length)

  for (const i in output) {
    expect(output[i].path).toBe(expected[i].path)
    expect(output[i].size).toBe(expected[i].size)
  }
}
/* global it, expect, beforeEach, afterEach, jest */
import { filesToStreams } from './files'
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
  for (const i in output) {
    expect(output[i].path).toBe(expected[i].path)
    expect(output[i].size).toBe(expected[i].size)
  }
}

it('chrome: input single file', async () => {
  const input = [{
    size: 3303420,
    name: 'Balloons.jpg',
    webkitRelativePath: ''
  }]

  const expected = [{
    size: 3303420,
    path: 'Balloons.jpg'
  }]

  const output = await filesToStreams(input)

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

it('chrome: input multiple files', async () => {
  const input = [{
    size: 4210819,
    name: 'a-file.jpg',
    webkitRelativePath: ''
  },
  {
    size: 135683,
    name: 'a-nother-file.jpg',
    webkitRelativePath: ''
  },
  {
    size: 3303420,
    name: 'one-more-file.jpg',
    webkitRelativePath: ''
  }]

  const expected = [{
    size: 4210819,
    path: 'a-file.jpg'
  },
  {
    size: 135683,
    path: 'a-nother-file.jpg'
  },
  {
    size: 3303420,
    path: 'one-more-file.jpg'
  }]

  const output = await filesToStreams(input)

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

it('chrome: input directory', async () => {
  const input = [{
    size: 4210819,
    name: 'a-file.jpg',
    webkitRelativePath: 'dir/a-file.jpg'
  },
  {
    size: 135683,
    name: 'a-nother-file.jpg',
    webkitRelativePath: 'dir/a-nother-file.jpg'
  },
  {
    size: 3303420,
    name: 'one-more-file.jpg',
    webkitRelativePath: 'dir/one-more-file.jpg'
  }]

  const expected = [{
    size: 4210819,
    path: 'dir/a-file.jpg'
  },
  {
    size: 135683,
    path: 'dir/a-nother-file.jpg'
  },
  {
    size: 3303420,
    path: 'dir/one-more-file.jpg'
  }]

  const output = await filesToStreams(input)

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

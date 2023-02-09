/* global it, expect */
import { normalizeFiles } from './files.js'

function expectRightFormat (output) {
  expect(Array.isArray(output)).toBe(true)

  for (const stream of output) {
    expect(Object.keys(stream).length).toBe(3)
    expect(stream.content instanceof Blob).toBe(true)
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

const mockFile = ({ size, name, webkitRelativePath, filepath }) => {
  const file = new File([new Uint8Array(size)], name)

  // Can't set readonly property, but can override it.
  Object.defineProperty(file, 'webkitRelativePath', {
    value: webkitRelativePath
  })

  if (filepath != null) {
    Object.defineProperty(file, 'filepath', {
      value: filepath
    })
  }

  return file
}

// All this tests work for both Firefox and Chrome.
// It seems that Firefox also honors webkitDirectory and works the
// same way when dropping directories and on inputs for directories.
// https://developer.mozilla.org/en-US/docs/Web/API/File/webkitRelativePath

it('input single file', async () => {
  const input = [{
    size: 3303420,
    name: 'Balloons.jpg',
    webkitRelativePath: ''
  }]

  const expected = [{
    size: 3303420,
    path: 'Balloons.jpg'
  }]

  const output = await normalizeFiles(input.map(mockFile))

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

it('input multiple files', async () => {
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

  const output = await normalizeFiles(input.map(mockFile))

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

it('input directory', async () => {
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

  const output = await normalizeFiles(input.map(mockFile))

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

it('drop single file', async () => {
  const input = [{
    size: 215786,
    name: 'T.pdf',
    webkitRelativePath: ''
  }]

  const expected = [{
    size: 215786,
    path: 'T.pdf'
  }]

  const output = await normalizeFiles(input.map(mockFile))

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

it('drop multiple file', async () => {
  const input = [{
    size: 215786,
    name: 'T.pdf',
    webkitRelativePath: ''
  },
  {
    size: 1511696,
    name: 'T2.pdf',
    webkitRelativePath: ''
  }]

  const expected = [{
    size: 215786,
    path: 'T.pdf'
  },
  {
    size: 1511696,
    path: 'T2.pdf'
  }]

  const output = await normalizeFiles(input.map(mockFile))

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

it('drop one directory', async () => {
  const input = [{
    size: 215786,
    filepath: 'Dir/T.pdf',
    webkitRelativePath: 'Dir/T.pdf'
  },
  {
    size: 1511696,
    filepath: 'Dir/T2.pdf',
    webkitRelativePath: 'Dir/T2.pdf'
  }]

  const expected = [{
    size: 215786,
    path: 'Dir/T.pdf'
  },
  {
    size: 1511696,
    path: 'Dir/T2.pdf'
  }]

  const output = await normalizeFiles(input.map(mockFile))

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

it('drop multiple directories', async () => {
  const input = [{
    size: 215786,
    filepath: 'Dir/T.pdf',
    webkitRelativePath: 'Dir/T.pdf'
  },
  {
    size: 1511696,
    filepath: 'Dir/T2.pdf',
    webkitRelativePath: 'Dir/T2.pdf'
  },
  {
    size: 2080512,
    filepath: 'Dir2/T3.pdf',
    webkitRelativePath: 'Dir/T3.pdf'
  },
  {
    size: 2023255,
    filepath: 'Dir2/T4.pdf',
    webkitRelativePath: 'Dir/T4.pdf'
  }]

  const expected = [{
    size: 215786,
    path: 'Dir/T.pdf'
  },
  {
    size: 1511696,
    path: 'Dir/T2.pdf'
  },
  {
    size: 2080512,
    path: 'Dir2/T3.pdf'
  },
  {
    size: 2023255,
    path: 'Dir2/T4.pdf'
  }]

  const output = await normalizeFiles(input.map(mockFile))

  expectRightFormat(output)
  expectRightOutput(output, expected)
})

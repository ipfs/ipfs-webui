/* global it, expect */
import DnDBackend from './dnd-backend.js'

function makeEntry (item) {
  if (item.isFile) {
    // eslint-disable-next-line
    item.file = (cb) => cb({
      fullPath: item.fullPath,
      name: item.name,
      isDirectory: false,
      isFile: true
    })
  }

  if (item.isDirectory) {
    item.createReader = () => ({
      readEntries: function (cb) {
        if (!this.called) {
          this.called = true
          cb(item.children.map(makeEntry))
        } else {
          // eslint-disable-next-line
          cb([])
        }
      }
    })
  }

  return item
}

function makeDropEvent (items) {
  const event = new window.Event('drop')

  event.dataTransfer = {
    items: items.map(item => {
      const entry = makeEntry(item)

      return {
        webkitGetAsEntry: () => entry,
        getAsEntry: () => entry
      }
    })
  }

  return event
}

function getBackend (items) {
  const backend = DnDBackend({
    getActions: () => [],
    getMonitor: () => ({
      getItemType: () => ''
    }),
    getRegistry: () => {},
    getContext: () => {},
    handleTopDropCapture: () => {}
  })

  backend.currentNativeSource = {
    item: {}
  }

  backend.handleTopDropCapture(makeDropEvent(items))
  return backend
}

function expectFile (toCheck, original) {
  expect(toCheck.fullPath).toBe(original.fullPath)
  expect(toCheck.isDirectory).toBe(original.isDirectory)
  expect(toCheck.isFile).toBe(original.isFile)
  expect(toCheck.name).toBe(original.name)
}

it('one file', async () => {
  const files = [{
    fullPath: '/test.txt',
    isDirectory: false,
    isFile: true,
    name: 'test.txt'
  }]

  const backend = getBackend(files)
  const res = await backend.currentNativeSource.item.filesPromise

  expect(res.length).toBe(1)
  expectFile(res[0], files[0])
})

it('multiple files', async () => {
  const files = [{
    fullPath: '/test.txt',
    isDirectory: false,
    isFile: true,
    name: 'test.txt'
  },
  {
    fullPath: '/testa.txt',
    isDirectory: false,
    isFile: true,
    name: 'testa.txt'
  }]

  const backend = getBackend(files)
  const res = await backend.currentNativeSource.item.filesPromise

  expect(res.length).toBe(files.length)
  expectFile(res[0], files[0])
  expectFile(res[1], files[1])
})

it('one directory with a file', async () => {
  const files = [{
    fullPath: '/dir',
    isDirectory: true,
    isFile: false,
    children: [{
      fullPath: '/dir/test.txt',
      isFile: true,
      isDirectory: false,
      name: 'test.txt'
    }],
    name: 'dir'
  }]

  const backend = getBackend(files)
  const res = await backend.currentNativeSource.item.filesPromise

  expect(res.length).toBe(1)
  expectFile(res[0], files[0].children[0])
})

it('multiple directories with some files', async () => {
  const files = [{
    fullPath: '/dir',
    isDirectory: true,
    isFile: false,
    children: [{
      fullPath: '/dir/test.txt',
      isFile: true,
      isDirectory: false,
      name: 'test.txt'
    },
    {
      fullPath: '/dir/t1.txt',
      isFile: true,
      isDirectory: false,
      name: 't1.txt'
    }],
    name: 'dir'
  },
  {
    fullPath: '/dir2',
    isDirectory: true,
    isFile: false,
    children: [{
      fullPath: '/dir2/t1.txt',
      isFile: true,
      isDirectory: false,
      name: 't1.txt'
    }],
    name: 'dir2'
  }]

  const backend = getBackend(files)
  const res = await backend.currentNativeSource.item.filesPromise

  expect(res.length).toBe(3)
  expectFile(res[0], files[0].children[0])
  expectFile(res[1], files[0].children[1])
  expectFile(res[2], files[1].children[0])
})

it('nested directories', async () => {
  const files = [{
    fullPath: '/dir',
    isDirectory: true,
    isFile: false,
    children: [{
      fullPath: '/dir/sub',
      isFile: false,
      isDirectory: true,
      name: 'sub',
      children: [{
        fullPath: '/dir/sub/test.txt',
        isFile: true,
        isDirectory: false,
        name: 'test.txt'
      }]
    }],
    name: 'dir'
  }]

  const backend = getBackend(files)
  const res = await backend.currentNativeSource.item.filesPromise
  expectFile(res[0], files[0].children[0].children[0])
})

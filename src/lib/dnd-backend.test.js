/* global it, expect */
import DnDBackend from './dnd-backend'

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
          cb(item.childs.map(makeEntry))
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
  let event = new window.Event('drop')

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
  expect(res[0].fullPath).toBe(files[0].fullPath)
  expect(res[0].isDirectory).toBe(files[0].isDirectory)
  expect(res[0].isFile).toBe(files[0].isFile)
  expect(res[0].name).toBe(files[0].name)
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
  expect(res[0].fullPath).toBe(files[0].fullPath)
  expect(res[0].isDirectory).toBe(files[0].isDirectory)
  expect(res[0].isFile).toBe(files[0].isFile)
  expect(res[0].name).toBe(files[0].name)
})

it('one directory with a file', async () => {
  const files = [{
    fullPath: '/dir',
    isDirectory: true,
    isFile: false,
    childs: [{
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
  expect(res[0].fullPath).toBe(files[0].childs[0].fullPath)
  expect(res[0].isDirectory).toBe(files[0].childs[0].isDirectory)
  expect(res[0].isFile).toBe(files[0].childs[0].isFile)
  expect(res[0].name).toBe(files[0].childs[0].name)
})

it('multiple directories with some files', async () => {
  const files = [{
    fullPath: '/dir',
    isDirectory: true,
    isFile: false,
    childs: [{
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
    childs: [{
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
  expect(res[0].fullPath).toBe(files[0].childs[0].fullPath)
  expect(res[0].isDirectory).toBe(files[0].childs[0].isDirectory)
  expect(res[0].isFile).toBe(files[0].childs[0].isFile)
  expect(res[0].name).toBe(files[0].childs[0].name)

  expect(res[1].fullPath).toBe(files[0].childs[1].fullPath)
  expect(res[1].isDirectory).toBe(files[0].childs[1].isDirectory)
  expect(res[1].isFile).toBe(files[0].childs[1].isFile)
  expect(res[1].name).toBe(files[0].childs[1].name)

  expect(res[2].fullPath).toBe(files[1].childs[0].fullPath)
  expect(res[2].isDirectory).toBe(files[1].childs[0].isDirectory)
  expect(res[2].isFile).toBe(files[1].childs[0].isFile)
  expect(res[2].name).toBe(files[1].childs[0].name)
})

it('nested directories', async () => {
  const files = [{
    fullPath: '/dir',
    isDirectory: true,
    isFile: false,
    childs: [{
      fullPath: '/dir/sub',
      isFile: false,
      isDirectory: true,
      name: 'sub',
      childs: [{
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

  expect(res.length).toBe(1)
  expect(res[0].fullPath).toBe(files[0].childs[0].childs[0].fullPath)
  expect(res[0].isDirectory).toBe(files[0].childs[0].childs[0].isDirectory)
  expect(res[0].isFile).toBe(files[0].childs[0].childs[0].isFile)
  expect(res[0].name).toBe(files[0].childs[0].childs[0].name)
})

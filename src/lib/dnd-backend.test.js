/* global it, expect */
import DnDBackend from './dnd-backend'

function makeEntry (item) {
  if (item.isFile) {
    item.file = (cb) => cb(item)
  }

  if (item.isDirectory) {
    item.createReader = () => ({
      readEntries: (cb) => { cb(item.childs.map(makeEntry)) }
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

it('one directory', async () => {
  const files = [{
    fullPath: '/dir',
    isDirectory: true,
    isFile: false,
    childs: [{
      fullPath: '/dir/test.txt',
      isFile: true,
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

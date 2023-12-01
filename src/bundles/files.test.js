/* global it, expect */
import { jest } from '@jest/globals'
import { composeBundlesRaw } from 'redux-bundler'
import createFilesBundle from './files/index.js'
import { CID } from 'multiformats/cid'

const iterate = async function * (items) {
  yield * items
}

function createMockIpfsBundle (ipfs) {
  return {
    name: 'ipfs',
    getExtraArgs: () => ({ getIpfs: () => ipfs }),
    selectIpfsConnected: () => true,
    selectIpfsReady: () => true
  }
}
const createMockIpfs = () => {
  return {
    addAll: jest.fn((files) => iterate(files.map((file) => ({
      path: file.path,
      cid: CID.parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'),
      size: file.size
    })))),
    files: {
      cp: jest.fn()
    }
  }
}

function createStore (ipfs) {
  return composeBundlesRaw(
    createMockIpfsBundle(ipfs),
    {
      name: 'mockRoutesBundle',
      selectRouteInfo: () => ({
        url: ''
      })
    },
    createFilesBundle()
  )()
}

it('write single file to root', async () => {
  const ipfs = createMockIpfs()
  const store = createStore(ipfs)

  const input = [{
    path: 'test.txt',
    size: 400
  }]

  await store.doFilesWrite(input, '/')

  expect(ipfs.addAll.mock.calls.length).toBe(1)
  expect(ipfs.addAll.mock.calls[0][0][0]).toBe(input[0])
  expect(ipfs.files.cp.mock.calls.length).toBe(1)
  expect(ipfs.files.cp.mock.calls[0][0]).toBe('/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
  expect(ipfs.files.cp.mock.calls[0][1]).toBe('/test.txt')
})

it('write single file to directory', async () => {
  const ipfs = createMockIpfs()
  const store = createStore(ipfs)

  const input = [{
    path: 'test.txt',
    size: 400
  }]

  await store.doFilesWrite(input, '/dir')

  expect(ipfs.addAll.mock.calls.length).toBe(1)
  expect(ipfs.addAll.mock.calls[0][0][0]).toBe(input[0])
  expect(ipfs.files.cp.mock.calls.length).toBe(1)
  expect(ipfs.files.cp.mock.calls[0][0]).toBe('/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
  expect(ipfs.files.cp.mock.calls[0][1]).toBe('/dir/test.txt')
})

it('write multiple file', async () => {
  const ipfs = createMockIpfs()
  const store = createStore(ipfs)

  const input = [{
    path: 'wow.txt',
    size: 566
  },
  {
    path: 'test.txt',
    size: 400
  }]

  await store.doFilesWrite(input, '/')

  expect(ipfs.addAll.mock.calls.length).toBe(1)
  expect(ipfs.addAll.mock.calls[0][0][0]).toBe(input[0])
  expect(ipfs.addAll.mock.calls[0][0][1]).toBe(input[1])
  expect(ipfs.files.cp.mock.calls.length).toBe(2)
  expect(ipfs.files.cp.mock.calls[0][0]).toBe('/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
  expect(ipfs.files.cp.mock.calls[0][1]).toBe('/wow.txt')
  expect(ipfs.files.cp.mock.calls[1][0]).toBe('/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
  expect(ipfs.files.cp.mock.calls[1][1]).toBe('/test.txt')
})

it('write multiple file with ignored file', async () => {
  const ipfs = createMockIpfs()
  const store = createStore(ipfs)

  const input = [{
    path: 'wow.txt',
    size: 566
  },
  {
    path: '.DS_Store',
    size: 566
  },
  {
    path: 'test.txt',
    size: 400
  }]

  await store.doFilesWrite(input, '/')

  expect(ipfs.addAll.mock.calls.length).toBe(1)
  expect(ipfs.addAll.mock.calls[0][0][0]).toBe(input[0])
  expect(ipfs.addAll.mock.calls[0][0][1]).toBe(input[2])
  expect(ipfs.files.cp.mock.calls.length).toBe(2)
  expect(ipfs.files.cp.mock.calls[0][0]).toBe('/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
  expect(ipfs.files.cp.mock.calls[0][1]).toBe('/wow.txt')
  expect(ipfs.files.cp.mock.calls[1][0]).toBe('/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
  expect(ipfs.files.cp.mock.calls[1][1]).toBe('/test.txt')
})

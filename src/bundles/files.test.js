/* global it, expect, beforeEach, afterEach, jest */
import { composeBundlesRaw } from 'redux-bundler'
import createFilesBundle from './files'

function createMockIpfsBundle (ipfs) {
  return {
    name: 'ipfs',
    getExtraArgs: () => ({ getIpfs: () => ipfs }),
    selectIpfsConnected: () => true,
    selectIpfsReady: () => true
  }
}
const createMockIpfs = (opts) => {
  opts = opts || {}
  opts.minLatency = opts.minLatency || 1
  opts.maxLatency = opts.maxLatency || 100

  return {
    add: jest.fn((streams, opts) => {
      return []
    })
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

it('idk', async () => {
  const ipfs = createMockIpfs()
  const store = createStore(ipfs)

  await store.doFilesWrite('/', [])

 //  expect(ipfs.add.mock.calls.length).toBe(1)
})

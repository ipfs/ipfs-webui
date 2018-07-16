/* global it, expect */
import { composeBundlesRaw, createReactorBundle } from 'redux-bundler'
import Multiaddr from 'multiaddr'
import createPeerLocationsBundle from './peer-locations'
import { fakeCid } from '../../test/helpers/cid'
import { randomInt, randomNum } from '../../test/helpers/random'
import sleep from '../../test/helpers/sleep'
import { fakeIp4 } from '../../test/helpers/ip'

async function fakePeer (data = {}) {
  const peerId = (await fakeCid()).toBaseEncodedString('base58btc')
  const ip = fakeIp4()
  return {
    peer: { toB58String: () => peerId },
    addr: Multiaddr(`/ip4/${ip}`),
    ...data
  }
}

const fakePeers = (count = 5) => Promise.all(Array(count).fill(0).map(fakePeer))

function createMockIpfsBundle (ipfs) {
  return {
    name: 'ipfs',
    getExtraArgs: () => ({ getIpfs: () => ipfs }),
    selectIpfsReady: () => true
  }
}

const mockPeersBundle = {
  name: 'peers',
  reducer (state = { data: [] }, action) {
    return action.type === 'UPDATE_MOCK_PEERS'
      ? { ...state, data: action.payload }
      : state
  },
  selectPeers: state => state.peers.data,
  doUpdateMockPeers: data => ({ dispatch }) => {
    dispatch({ type: 'UPDATE_MOCK_PEERS', payload: data })
  }
}

function fakeGeoIpData () {
  return {
    data: JSON.stringify({
      type: 'Leaf',
      data: {
        min: Infinity,
        '-1': {
          data: [
            null,
            null,
            null,
            null,
            null,
            randomNum(0, 90),
            randomNum(-180, 180),
            null,
            null
          ]
        }
      }
    })
  }
}

const createMockIpfs = (opts) => {
  opts = opts || {}
  opts.minLatency = opts.minLatency || 1
  opts.maxLatency = opts.maxLatency || 100

  return {
    object: {
      get: (_, cb) => {
        setTimeout(() => {
          cb(null, fakeGeoIpData())
        }, randomInt(opts.minLatency, opts.maxLatency))
      }
    }
  }
}

function expectLocation (obj) {
  expect(obj).toMatchObject({
    latitude: expect.any(Number),
    longitude: expect.any(Number)
  })
}

it('should get locations for peers', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    createMockIpfsBundle(createMockIpfs({ maxLatency: 1 })),
    mockPeersBundle,
    createPeerLocationsBundle({
      // Ensure added peers are all processed concurrently
      concurrency: 5
    })
  )()

  const peers = store.selectPeers()
  expect(peers).toEqual([])

  let peerLocs = store.selectPeerLocations()
  expect(Object.keys(peerLocs)).toEqual([])

  const totalPeers = randomInt(1, 5)
  const nextPeers = await fakePeers(totalPeers)

  // Add the peers
  store.doUpdateMockPeers(nextPeers)
  await sleep(50) // Wait for the locations to be resolved
  peerLocs = store.selectPeerLocations()

  expect(Object.keys(peerLocs)).toHaveLength(totalPeers)

  Object.keys(peerLocs).forEach(peerId => {
    const peer = nextPeers.find(p => p.peer.toB58String() === peerId)
    expect(peer).toBeTruthy()
    expectLocation(peerLocs[peerId][peer.addr.toString()])
  })
})

it('should fail on non IPv4 address', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    createMockIpfsBundle(createMockIpfs({ maxLatency: 1 })),
    mockPeersBundle,
    createPeerLocationsBundle({
      // Ensure added peers are all processed concurrently
      concurrency: 5
    })
  )()

  const peers = store.selectPeers()
  expect(peers).toEqual([])

  let peerLocs = store.selectPeerLocations()
  expect(Object.keys(peerLocs)).toEqual([])

  let peerLocsRaw = store.selectPeerLocations()
  expect(Object.keys(peerLocsRaw)).toEqual([])

  const peer = await fakePeer({ addr: Multiaddr('/ip6/::') })
  const nextPeers = [peer]

  store.doUpdateMockPeers(nextPeers)
  await sleep() // Wait for the locations to be resolved
  peerLocs = store.selectPeerLocations()
  peerLocsRaw = store.selectPeerLocationsRaw()

  expect(Object.keys(peerLocs)).toHaveLength(0)
  expect(Object.keys(peerLocsRaw)).toHaveLength(1)

  Object.keys(peerLocsRaw).forEach(peerId => {
    expect(peerId).toBe(peer.peer.toB58String())
    expect(peerLocsRaw[peerId][peer.addr.toString()].state).toBe('failed')
    expect(peerLocsRaw[peerId][peer.addr.toString()].error).toBeTruthy()
    expect(peerLocsRaw[peerId][peer.addr.toString()].error.message)
      .toMatch(/^Unable to resolve location for non-IPv4 address/)
  })
})

it('should resolve alternative address for failed address lookup', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    createMockIpfsBundle(createMockIpfs({ maxLatency: 1 })),
    mockPeersBundle,
    createPeerLocationsBundle()
  )()

  const peers = store.selectPeers()
  expect(peers).toEqual([])

  let peerLocs = store.selectPeerLocations()
  expect(Object.keys(peerLocs)).toEqual([])

  // Peer with address we can't resolve
  const peer = await fakePeer({ addr: Multiaddr('/ip6/::') })

  const nextPeers = [
    peer,
    // Same peer, but with address we _can_ resolve
    { ...peer, addr: Multiaddr('/ip4/192.168.0.1') }
  ]

  // Add the peers
  store.doUpdateMockPeers(nextPeers)
  await sleep(50) // Wait for the locations to be resolved
  peerLocs = store.selectPeerLocations()

  expect(Object.keys(peerLocs)).toHaveLength(1)
  expectLocation(peerLocs[nextPeers[1].peer.toB58String()][nextPeers[1].addr.toString()])
})

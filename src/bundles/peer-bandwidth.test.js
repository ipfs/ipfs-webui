/* global it, expect */
import { composeBundlesRaw, createReactorBundle } from 'redux-bundler'
import createPeerBandwidthBundle from './peer-bandwidth'
import { fakeCid } from '../../test/helpers/cid'
import { randomInt } from '../../test/helpers/random'
import sleep from '../../test/helpers/sleep'
import { fakeBandwidth } from '../../test/helpers/bandwidth'

async function fakePeer () {
  const peerId = (await fakeCid()).toBaseEncodedString('base58btc')
  return { peer: { toB58String: () => peerId } }
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

const mockRoutesBundle = { name: 'routes', selectRouteInfo: _ => ({ url: '/' }) }

const createMockIpfs = (opts) => {
  opts = opts || {}
  opts.minLatency = opts.minLatency || 1
  opts.maxLatency = opts.maxLatency || 100

  return {
    stats: {
      bw: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(fakeBandwidth())
        }, randomInt(opts.minLatency, opts.maxLatency))
      })
    }
  }
}

it('should sync added peers', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    mockRoutesBundle,
    createMockIpfsBundle(createMockIpfs()),
    mockPeersBundle,
    createPeerBandwidthBundle()
  )()

  const peers = store.selectPeers()
  expect(peers).toEqual([])

  let bwPeers = store.selectPeerBandwidthPeers()
  expect(bwPeers).toEqual([])

  const totalPeers = randomInt(1, 100)
  const nextPeers = await fakePeers(totalPeers)

  // Add the peers
  store.doUpdateMockPeers(nextPeers)
  await sleep() // Wait for the reactions to happen
  bwPeers = store.selectPeerBandwidthPeers()

  expect(bwPeers.length).toBe(totalPeers)

  bwPeers.forEach(({ id }) => {
    expect(nextPeers.some(p => p.peer.toB58String() === id)).toBe(true)
  })
})

it('should sync removed peers', async () => {
  const totalPeers = randomInt(2, 100)
  const peers = await fakePeers(totalPeers)

  const store = composeBundlesRaw(
    createReactorBundle(),
    mockRoutesBundle,
    createMockIpfsBundle(createMockIpfs()),
    mockPeersBundle,
    createPeerBandwidthBundle()
  )({
    peers: { data: peers }
  })

  // Wait for the bundle to initially sync peers
  await sleep()

  expect(store.selectPeers()).toEqual(peers)

  let bwPeers = store.selectPeerBandwidthPeers()
  expect(bwPeers.length).toBe(peers.length)

  bwPeers.forEach(({ id }) => {
    expect(peers.some(p => p.peer.toB58String() === id)).toBe(true)
  })

  const nextTotalPeers = randomInt(1, totalPeers)
  const nextPeers = peers.slice(0, nextTotalPeers)

  // Remove the peers
  store.doUpdateMockPeers(nextPeers)
  await sleep()
  bwPeers = store.selectPeerBandwidthPeers()

  expect(bwPeers.length).toBe(nextPeers.length)

  bwPeers.forEach(({ id }) => {
    expect(nextPeers.some(p => p.peer.toB58String() === id)).toBe(true)
  })
})

it('should sync added and removed peers', async () => {
  const totalPeers = randomInt(2, 100)
  const peers = await fakePeers(totalPeers)

  const store = composeBundlesRaw(
    createReactorBundle(),
    mockRoutesBundle,
    createMockIpfsBundle(createMockIpfs()),
    mockPeersBundle,
    createPeerBandwidthBundle()
  )({
    peers: { data: peers }
  })

  // Wait for the bundle to initially sync peers
  await sleep()

  expect(store.selectPeers()).toEqual(peers)

  let bwPeers = store.selectPeerBandwidthPeers()
  expect(bwPeers.length).toBe(peers.length)

  bwPeers.forEach(({ id }) => {
    expect(peers.some(p => p.peer.toB58String() === id)).toBe(true)
  })

  const totalAddedPeers = randomInt(1, 100)
  const totalRemovedPeers = randomInt(1, totalPeers)

  const nextPeers = peers
    .slice(0, totalRemovedPeers)
    .concat(await fakePeers(totalAddedPeers))

  // Add and remove the peers
  store.doUpdateMockPeers(nextPeers)
  await sleep()
  bwPeers = store.selectPeerBandwidthPeers()

  expect(bwPeers.length).toBe(nextPeers.length)

  bwPeers.forEach(({ id }) => {
    expect(nextPeers.some(p => p.peer.toB58String() === id)).toBe(true)
  })
})

it('should get bandwidth for added peers', async () => {
  const totalPeers = randomInt(1, 5)
  const peers = await fakePeers(totalPeers)

  const store = composeBundlesRaw(
    createReactorBundle(),
    mockRoutesBundle,
    // This IPFS takes at minimum 20ms to respond to a function call
    createMockIpfsBundle(createMockIpfs({ minLatency: 20, maxLatency: 30 })),
    mockPeersBundle,
    // Up the concurrency value for the bundle so all the bandwidth updates
    // are fired off at the same time
    createPeerBandwidthBundle({ peerUpdateConcurrency: totalPeers + 1 })
  )({
    peers: { data: peers }
  })

  // Wait for the bundle to initially sync peers
  await sleep(10)

  // Now the peers should be synced, but not yet updated with bandwidth stats
  let bwPeers = store.selectPeerBandwidthPeers()
  expect(bwPeers.length).toBe(peers.length)

  bwPeers.forEach(({ bw }) => expect(bw).toBeFalsy())

  // Wait for all the bandwdith stats to come in
  await sleep(30)

  // Now all the peers should have had their bandwidth updated
  bwPeers = store.selectPeerBandwidthPeers()
  expect(bwPeers.length).toBe(peers.length)

  bwPeers.forEach(({ bw }) => expect(bw).toBeTruthy())
})

it('should periodically update bandwidth for peers', async () => {
  const totalPeers = randomInt(1, 2)
  const peers = await fakePeers(totalPeers)

  const store = composeBundlesRaw(
    createReactorBundle(),
    mockRoutesBundle,
    createMockIpfsBundle(createMockIpfs({ minLatency: 0, maxLatency: 1 })),
    mockPeersBundle,
    // Up the concurrency value for the bundle so all the bandwidth updates
    // are fired off at the same time
    createPeerBandwidthBundle({
      peerUpdateConcurrency: totalPeers + 1,
      tickResolution: 100,
      peerUpdateInterval: 50
    })
  )({
    peers: { data: peers }
  })

  await sleep(50)

  // Now all the peers should be synced and have had their bandwidth updated
  const bwPeers = store.selectPeerBandwidthPeers()
  expect(bwPeers.length).toBe(peers.length)

  bwPeers.forEach(({ bw }) => expect(bw).toBeTruthy())

  await sleep(100)
  store.dispatch({ type: 'APP_IDLE' })
  await sleep(50)

  // Now all the peers should have had their bandwidth updated
  const nextBwPeers = store.selectPeerBandwidthPeers()

  nextBwPeers.forEach(nextPeer => {
    const peer = bwPeers.find(p => p.id === nextPeer.id)
    expect(peer).toBeTruthy()
    expect(nextPeer.bw).toBeTruthy()
    expect(peer.lastSuccess).not.toBe(nextPeer.lastSuccess)
    expect(peer.bw.totalIn.eq(nextPeer.bw.totalIn)).toBe(false)
    expect(peer.bw.totalOut.eq(nextPeer.bw.totalOut)).toBe(false)
    expect(peer.bw.rateIn.eq(nextPeer.bw.rateIn)).toBe(false)
    expect(peer.bw.rateOut.eq(nextPeer.bw.rateOut)).toBe(false)
  })
})

it('should update peer bandwidth according to concurrency option', async () => {
  const totalPeers = randomInt(5, 10)
  const peers = await fakePeers(totalPeers)
  const peerUpdateConcurrency = 5

  const store = composeBundlesRaw(
    createReactorBundle(),
    mockRoutesBundle,
    createMockIpfsBundle(createMockIpfs({ minLatency: 100, maxLatency: 150 })),
    mockPeersBundle,
    createPeerBandwidthBundle({ peerUpdateConcurrency })
  )({
    peers: { data: peers }
  })

  await sleep(50)

  // We should now be updating peerUpdateConcurrency peers
  let updatingPeerIds = store.selectPeerBandwidthUpdatingPeerIds()
  expect(updatingPeerIds.length).toBe(peerUpdateConcurrency)

  await sleep(150)

  // We should now have updated peerUpdateConcurrency peers
  let bwPeers = store.selectPeerBandwidthPeers()

  // Assert all these peers now have a bandwidth stat
  updatingPeerIds.forEach(id => {
    const peer = bwPeers.find(p => p.id === id)
    expect(peer).toBeTruthy()
    expect(peer.bw).toBeTruthy()
  })

  // Assert we're updating the rest of the peers now
  updatingPeerIds = store.selectPeerBandwidthUpdatingPeerIds()
  expect(updatingPeerIds.length).toBe(totalPeers - peerUpdateConcurrency)

  await sleep(150)

  // We should now have updated all peers
  bwPeers = store.selectPeerBandwidthPeers()

  // Assert all these peers now have a bandwidth stat
  updatingPeerIds.forEach(id => {
    const peer = bwPeers.find(p => p.id === id)
    expect(peer).toBeTruthy()
    expect(peer.bw).toBeTruthy()
  })
})

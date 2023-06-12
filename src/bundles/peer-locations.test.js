import createPeersLocationBundle from './peer-locations.js'
import { createSelector, composeBundlesRaw, createReactorBundle } from 'redux-bundler'
import pkgJson from '../../package.json'
import { getConfiguredCache } from 'money-clip'

const { dependencies } = pkgJson

// We reuse cached geoip lookups as long geoipVersion is the same.
const geoipVersion = dependencies['ipfs-geoip']

function createMockIpfsBundle (ipfs) {
  return {
    name: 'ipfs',
    getExtraArgs: () => ({ getIpfs: () => ipfs }),
    selectIpfsConnected: () => true,
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

const createMockIpfs = (opts) => {
  opts = opts || {}
  opts.minLatency = opts.minLatency || 1
  opts.maxLatency = opts.maxLatency || 100

  return {
    stats: {
      bw: async function * () {
        // const bw = await new Promise(resolve => setTimeout(() => resolve(fakeBandwidth()), randomInt(opts.minLatency, opts.maxLatency)))
        // yield bw
      }
    }
  }
}
function createStore ({ selectors, store = {}, bundleOpts = undefined }) {
  const mockPeerLocationsBundle = createPeersLocationBundle(bundleOpts)
  const mockExtrasBundle = {
    ...selectors
  }
  const fakeTime = Date.now()
  return composeBundlesRaw(
    {
      name: 'appTime',
      reducer: () => fakeTime,
      selectAppTime: state => fakeTime
    },
    createReactorBundle(),
    createMockIpfsBundle(createMockIpfs()),
    mockPeersBundle,
    mockPeerLocationsBundle,
    {
      name: 'mockExtrasBundle',
      ...mockExtrasBundle
    }
  )(store)
}

function callSelectorMethod (selectorFn, ...args) {
  return selectorFn({}, args.map((arg) => () => arg))()
}

async function cacheIpAddresses (mockCache, ...ipAddresses) {
  await Promise.all(ipAddresses.map((ip) => {
    return mockCache.set(ip, 'location-cached')
  }))
}
async function mockGeoIpCache (...ipAddresses) {
  const mockCache = getConfiguredCache({
    name: 'geoipCache',
    version: geoipVersion,
    maxAge: 1000 * 60 * 60
  })
  await cacheIpAddresses(mockCache, ...ipAddresses)

  return mockCache
}

async function getPeerLocationsFromStore ({ store, failMs = 5000 }) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting ${failMs}ms for peerLocations from store`)), failMs)
    const unsub = store.subscribeToSelectors(['selectPeerLocations'], ({ peerLocations }) => {
      clearTimeout(timeout)
      unsub()
      resolve(peerLocations)
    })
  })
}

describe('reactPeerLocationsFetch', () => {
  it.skip('should declare its dependencies', async () => {
    createPeersLocationBundle()

    expect(createSelector).toHaveBeenNthCalledWith(1,
      'selectRouteInfo',
      'selectPeerLocationsShouldUpdate',
      'selectIpfsConnected',
      expect.any(Function)
    )
  })

  it('should trigger doFetchPeerLocations', () => {
    const { reactPeerLocationsFetch } = createPeersLocationBundle()
    const result = callSelectorMethod(reactPeerLocationsFetch, { url: '/peers' }, true, true)

    expect(result).toEqual({ actionCreator: 'doFetchPeerLocations' })
  })

  it('should do nothing when the route is not peers or its not time to update', () => {
    const { reactPeerLocationsFetch } = createPeersLocationBundle()
    expect(callSelectorMethod(reactPeerLocationsFetch, { url: '/another-url' }, true, true)).toBeFalsy()
    expect(callSelectorMethod(reactPeerLocationsFetch, { url: '/peers' }, false, true)).toBeFalsy()
    expect(callSelectorMethod(reactPeerLocationsFetch, { url: '/peers' }, false, false)).toBeFalsy()
    expect(callSelectorMethod(reactPeerLocationsFetch, { url: '/peers' }, true, false)).toBeFalsy()
  })
})

describe('selectPeerLocationsForSwarm', () => {
  it.skip('should declare its dependencies', () => {
    createPeersLocationBundle()

    expect(createSelector).toHaveBeenNthCalledWith(2,
      'selectPeers',
      'selectPeerLocations',
      'selectBootstrapPeers',
      'selectIdentity',
      expect.any(Function)
    )
  })

  it('should do nothing if peers is not defined', () => {
    const { selectPeerLocationsForSwarm } = createPeersLocationBundle()

    expect(callSelectorMethod(selectPeerLocationsForSwarm)).toBeFalsy()
  })

  it('should map the peers with the location information', async () => {
    const { selectPeerLocationsForSwarm } = createPeersLocationBundle()

    const locations = {
      1: {
        country_name: 'Republic of Mocks',
        city: 'Mocky',
        country_code: 'ROM',
        longitude: 1.11,
        latitude: 1.01
      },
      2: {
        country_name: 'Republic of Mocks',
        country_code: 'ROM',
        longitude: 2.22,
        latitude: 2.02
      }
    }

    const peer1 = {
      peer: '1',
      addr: {
        protoNames: () => ['1/test', 'endOfTest'],
        toString: () => '1.test',
        encapsulate: (arg) => ({ toString: () => arg })
      },
      latency: 'n/a'
    }

    const peer2 = {
      peer: '2',
      addr: {
        protoNames: () => ['2/test', 'endOfTest'],
        toString: () => '2.test',
        encapsulate: (arg) => ({ toString: () => arg }),
        toOptions: () => ({ transport: 'p2p-circuit', host: 'hosty' })
      },
      latency: '1s'
    }

    const result = await callSelectorMethod(selectPeerLocationsForSwarm, [peer1, peer2], locations, ['/p2p/1'])
    expect(result).toEqual([
      {
        address: '1.test',
        connection: '1/test • endOfTest',
        coordinates: [1.11, 1.01],
        direction: undefined,
        flagCode: 'ROM',
        isNearby: false,
        isPrivate: false,
        latency: undefined,
        location: 'Republic of Mocks, Mocky',
        peerId: '1',
        protocols: ''
      },
      {
        address: '2.test',
        connection: '2/test • endOfTest',
        coordinates: [2.22, 2.02],
        direction: undefined,
        flagCode: 'ROM',
        isNearby: false,
        isPrivate: false,
        latency: 1000,
        location: 'Republic of Mocks',
        peerId: '2',
        protocols: ''
      }

    ])
  })

  it('should also handle the public ip', async () => {
    const { selectPeerLocationsForSwarm } = createPeersLocationBundle()

    const locations = {
      1: {
        country_name: 'Republic of Mocks',
        city: 'Mocky',
        country_code: 'ROM',
        longitude: 1.11,
        latitude: 1.01
      }
    }

    const peer1 = {
      peer: '1',
      addr: {
        protoNames: () => ['1/test', 'endOfTest'],
        toString: () => '1.test',
        encapsulate: (arg) => ({ toString: () => arg }),
        nodeAddress: () => ({ address: '127.0.0.1' })
      },
      latency: 'n/a'
    }

    const identity = {
      addresses: [
        { address: '127.0.0.1' },
        { address: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }
      ]
    }

    const result = await callSelectorMethod(selectPeerLocationsForSwarm, [peer1], locations, ['/ipfs/1'], identity)
    expect(result).toEqual([
      {
        address: '1.test',
        connection: '1/test • endOfTest',
        coordinates: [1.11, 1.01],
        flagCode: 'ROM',
        isNearby: false,
        isPrivate: true,
        latency: undefined,
        location: 'Republic of Mocks, Mocky',
        peerId: '1',
        protocols: ''
      }
    ])
  })

  it('should also handle the near addresses', async () => {
    const { selectPeerLocationsForSwarm } = createPeersLocationBundle()

    const peer1 = {
      peer: '1',
      addr: {
        toString: () => '1.test',
        encapsulate: (arg) => ({ toString: () => arg }),
        protoNames: () => ['1/test', 'endOfTest'],
        nodeAddress: () => ({ address: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' })
      },
      latency: 'n/a'
    }

    const identity = {
      addresses: [
        // migration to ESM: multiaddr must be string, Buffer, or another Multiaddr
        '/ip4/127.0.0.1/udp/1234',
        '/ip6/2001:0db8:85a3:0000:0000:8a2e:0370:7334/udp/3333',
        '/ip4/127.0.0.1'
      ]
    }

    const result = await callSelectorMethod(selectPeerLocationsForSwarm, [peer1], null, ['/ipfs/1'], identity)
    expect(result).toEqual([
      {
        address: '1.test',
        connection: '1/test • endOfTest',
        direction: undefined,
        coordinates: null,
        flagCode: null,
        isNearby: true,
        isPrivate: false,
        latency: undefined,
        location: null,
        peerId: '1',
        protocols: ''
      }
    ])
  })
})

describe('selectPeersCoordinates', () => {
  it.skip('should declare its dependencies', () => {
    createPeersLocationBundle()

    expect(createSelector).toHaveBeenNthCalledWith(3,
      'selectPeerLocationsForSwarm',
      expect.any(Function)
    )
  })

  it('should do nothing when there are no peers', async () => {
    const { selectPeersCoordinates } = createPeersLocationBundle()
    expect(await callSelectorMethod(selectPeersCoordinates)).toEqual([])
  })

  it('should aggregate peers by close coordinates', async () => {
    const { selectPeersCoordinates } = createPeersLocationBundle()
    const result = await callSelectorMethod(selectPeersCoordinates, [
      { peerId: '1', coordinates: [1, 1] },
      { peerId: '2' },
      { peerId: '3', coordinates: [1000, 1000] },
      { peerId: '4', coordinates: [2, 2] }
    ])

    expect(result).toEqual([
      { peerIds: ['1', '4'], coordinates: [1, 1] },
      { peerIds: ['3'], coordinates: [1000, 1000] }
    ])
  })
})

describe('PeerLocationResolver', () => {
  describe('findLocations', () => {
    it('should find the location of given peers', async () => {
      await mockGeoIpCache('4.4.4.4')

      const fakePeers = [
        {
          peer: '1aaa1',
          latency: 'n/a',
          addr: {
            stringTuples: () => [[4, '123.123.123.123']]
          }
        },
        {
          peer: '1b1',
          latency: '1ms',
          addr: {
            stringTuples: () => [[4, '127.0.0.1']]
          }
        },
        {
          peer: '3b3',
          latency: '1ms',
          addr: {
            stringTuples: () => [[4, '16.19.16.19']]
          }
        },
        {
          peer: '44asd',
          latency: '1ms',
          addr: {
            stringTuples: () => [[4, '4.4.4.4']]
          }
        },
        {
          peer: '4sameAs4',
          latency: '1ms',
          addr: {
            stringTuples: () => [[4, '4.4.4.4']]
          }
        },
        {
          peer: 'newPeerThatShouldThrow',
          latency: '100s',
          addr: {
            stringTuples: () => [[4, '5.5.5.5']]
          }
        },
        {
          peer: 'sameIpAs1',
          latency: 'n/a',
          addr: {
            stringTuples: () => [[4, '123.123.123.123']]
          }
        }
      ]

      const store = await createStore({
        selectors: {
          selectAvailableGatewayUrl: () => 'https://ipfs.io',
          selectIsOnline: () => true,
          selectBootstrapPeers: () => fakePeers,
          selectPeers: () => fakePeers,
          selectRouteInfo: _ => ({ url: '/peers' }),
          selectIdentity: () => ({
            addresses: [
              '/p2p/1aaa1',
              '/ip4/4.4.4.4/udp/1234'
            ]
          })
        }
      })

      const result = await new Promise((resolve, reject) => {
        const timeout = setTimeout(reject, 5000)
        const unsub = store.subscribeToSelectors(['selectPeerLocations'], ({ peerLocations }) => {
          clearTimeout(timeout)
          unsub()
          resolve(peerLocations)
        })
      })

      expect(result).toEqual({
        '44asd': 'location-cached',
        '4sameAs4': 'location-cached'
      })
    })
  })

  describe('optimizedPeerSet', () => {
    it('should return sets of 10, 100, 200 peers and more according to the number of calls', async () => {
      const ipAddresses = []
      const peers = new Array(1000).fill().map((_, index) => {
        const ipAddress = `${index}.0.${index}.${index}`
        ipAddresses.push(ipAddress)
        return ({
          peer: `${index}aa`,
          latency: '1ms',
          addr: {
            stringTuples: () => [[4, ipAddress]]
          }
        })
      })

      const mockedGeoIpCache = await mockGeoIpCache(...ipAddresses.slice(0, 10))

      const store = await createStore({
        selectors: {
          selectAvailableGatewayUrl: () => 'https://ipfs.io',
          selectIsOnline: () => true,
          selectBootstrapPeers: () => peers,
          selectPeers: () => peers,
          selectRouteInfo: _ => ({ url: '/peers' }),
          selectIdentity: () => ({
            addresses: [
              '/p2p/1aaa1',
              '/ip4/4.4.4.4/udp/1234'
            ]
          })
        }
      })

      const result10 = await getPeerLocationsFromStore({ store })

      const expect10 = {
        '0aa': 'location-cached',
        '1aa': 'location-cached',
        '2aa': 'location-cached',
        '3aa': 'location-cached',
        '4aa': 'location-cached',
        '5aa': 'location-cached',
        '6aa': 'location-cached',
        '7aa': 'location-cached',
        '8aa': 'location-cached',
        '9aa': 'location-cached'
      }
      expect(result10).toEqual(expect10)

      // ==== 100 ====
      await cacheIpAddresses(mockedGeoIpCache, ...ipAddresses.slice(10, 100))
      await store.doMarkPeerLocationsAsOutdated()

      const result100 = await getPeerLocationsFromStore({ store })

      const expect100 = new Array(90).fill().reduce((prev, _, index) => ({
        ...prev,
        [`${index + 10}aa`]: 'location-cached'
      }), expect10)

      expect(result100).toEqual(expect100)

      // ==== 200 ====
      await cacheIpAddresses(mockedGeoIpCache, ...ipAddresses.slice(100, 200))
      await store.doMarkPeerLocationsAsOutdated()

      const result200 = await getPeerLocationsFromStore({ store })

      const expect200 = new Array(100).fill().reduce((prev, _, index) => ({
        ...prev,
        [`${index + 100}aa`]: 'location-cached'
      }), expect100)

      expect(result200).toEqual(expect200)

      // ==== Over 200 ====
      await cacheIpAddresses(mockedGeoIpCache, ...ipAddresses.slice(200, 1000))
      await store.doMarkPeerLocationsAsOutdated()

      const resultMore = await getPeerLocationsFromStore({ store })

      const expectMore = new Array(800).fill().reduce((prev, _, index) => ({
        ...prev,
        [`${index + 200}aa`]: 'location-cached'
      }), expect200)

      expect(resultMore).toEqual(expectMore)
    })
  })
})

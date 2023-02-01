import { createSelector } from 'redux-bundler'
import createPeersLocationBundle from './peer-locations.js'

jest.mock('redux-bundler', () => ({
  createAsyncResourceBundle: (args) => ({ ...args }),
  createSelector: (...args) => args[args.length - 1]
}))

jest.mock('money-clip', () => ({
  getConfiguredCache: () => ({
    get: jest.fn((arg) => (arg === '5.5.5.5' || arg === '123.123.123.123') ? false : 'location-cached'),
    set: jest.fn()
  })
}))

jest.mock('ipfs-geoip', () => ({
  lookup: (_, address) => {
    if (address === '5.5.5.5') throw new Error()
    return `${address}+looked-up`
  }
}))

jest.mock('multiaddr', () =>
  (args) => ({ nodeAddress: () => args })
)

jest.mock('hashlru', () => () => ({
  has: (arg) => arg === '16.19.16.19',
  set: jest.fn()
}))

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
    const result = reactPeerLocationsFetch({ url: '/peers' }, true, true)

    expect(result).toEqual({ actionCreator: 'doFetchPeerLocations' })
  })

  it('should do nothing when the route is not peers or its not time to update', () => {
    const { reactPeerLocationsFetch } = createPeersLocationBundle()
    expect(reactPeerLocationsFetch({ url: '/another-url' }, true, true)).toBeFalsy()
    expect(reactPeerLocationsFetch({ url: '/peers' }, false, true)).toBeFalsy()
    expect(reactPeerLocationsFetch({ url: '/peers' }, false, false)).toBeFalsy()
    expect(reactPeerLocationsFetch({ url: '/peers' }, true, false)).toBeFalsy()
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

    expect(selectPeerLocationsForSwarm()).toBeFalsy()
  })

  it('should map the peers with the location information', () => {
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

    const result = selectPeerLocationsForSwarm([peer1, peer2], locations, ['/p2p/1'])
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

  it('should also handle the public ip', () => {
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

    const result = selectPeerLocationsForSwarm([peer1], locations, ['/ipfs/1'], identity)
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

  it('should also handle the near addresses', () => {
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
        { address: '127.0.0.1' },
        { address: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }
      ]
    }

    const result = selectPeerLocationsForSwarm([peer1], null, ['/ipfs/1'], identity)
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

  it('should do nothing when there are no peers', () => {
    const { selectPeersCoordinates } = createPeersLocationBundle()
    expect(selectPeersCoordinates()).toEqual([])
  })

  it('should aggregate peers by close coordinates', () => {
    const { selectPeersCoordinates } = createPeersLocationBundle()
    const result = selectPeersCoordinates([
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
      const { getPromise } = createPeersLocationBundle()

      const result = await getPromise({
        store: {
          selectPeers: () => [
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
          ],
          selectAvailableGatewayUrl: () => 'https://ipfs.io'
        },
        getIpfs: () => 'smth'
      })

      expect(result).toEqual({
        '44asd': 'location-cached',
        '4sameAs4': 'location-cached'
      })
    })
  })

  describe('optimizedPeerSet', () => {
    it('should return sets of 10, 100, 200 peers and more according to the number of calls', async () => {
      const { getPromise } = createPeersLocationBundle()

      const peers = new Array(1000).fill().map((_, index) => ({
        peer: `${index}aa`,
        latency: '1ms',
        addr: {
          stringTuples: () => [[4, `${index}.0.${index}.${index}`]]
        }
      }))

      const mockStore = {
        selectAvailableGatewayUrl: () => 'https://ipfs.io',
        selectPeers: () => peers
      }

      const result = await getPromise({
        store: mockStore
      })

      expect(result).toEqual({
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
      })

      // ==== 100 ====

      const result100 = await getPromise({
        store: mockStore
      })

      const expect100 = new Array(100).fill().reduce((prev, _, index) => ({
        ...prev,
        [`${index}aa`]: 'location-cached'
      }), {})

      expect(result100).toEqual(expect100)

      // ==== 200 ====

      const result200 = await getPromise({
        store: mockStore
      })
      const expect200 = new Array(200).fill().reduce((prev, _, index) => ({
        ...prev,
        [`${index}aa`]: 'location-cached'
      }), {})

      expect(result200).toEqual(expect200)

      // ==== Over 200 ====

      const resultMore = await getPromise({
        store: mockStore
      })

      const expectMore = new Array(1000).fill().reduce((prev, _, index) => ({
        ...prev,
        [`${index}aa`]: 'location-cached'
      }), {})

      expect(resultMore).toEqual(expectMore)
    })
  })
})

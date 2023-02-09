/* global describe, it, expect, afterEach */
// @ts-check
import { jest } from '@jest/globals'
import { getDeploymentEnv } from './env.js'

describe('env.js', function () {
  describe('getDeploymentEnv', function () {
    const fetchMock = jest.fn()
    function testOriginAndEnv (url, fetchImpl, expectedEnv, numberOfFetchCalls) {
      it(`${url} returns env ${expectedEnv}`, async () => {
        const { origin } = new URL(url)
        // @ts-expect-error
        jest.spyOn(globalThis, 'location', 'get').mockReturnValue({ origin })
        fetchMock.mockImplementation(fetchImpl)
        expect(await getDeploymentEnv()).toBe(expectedEnv)
        expect(fetchMock.mock.calls.length).toBe(numberOfFetchCalls)
      })
    }
    const originalFetch = globalThis.fetch
    beforeAll(() => {
      globalThis.fetch = fetchMock
    })

    afterEach(function () {
      jest.clearAllMocks()
    })
    afterAll(() => {
      globalThis.fetch = originalFetch
    })
    /**
     * webui.ipfs deployed endpoints
     */
    testOriginAndEnv('https://webui.ipfs.io', () => {}, 'webui.ipfs', 0)
    testOriginAndEnv('https://webui-ipfs-io.ipns.dweb.link/', () => {}, 'webui.ipfs', 0)
    testOriginAndEnv('https://webui.ipfs.tech', () => {}, 'webui.ipfs', 0)
    testOriginAndEnv('https://some-random-url', () => { throw new Error('no match on origin') }, 'webui.ipfs', 1)
    testOriginAndEnv('https://some-random-url', () => ({ redirected: false, url: 'https://some-random-url/webui' }), 'webui.ipfs', 1)

    /**
     * local webui endpoints
     */
    testOriginAndEnv('http://webui.ipfs.io.ipns.localhost:8080/', () => {}, 'local', 0)
    testOriginAndEnv('http://webui-ipfs.io.ipns.localhost:8080/', () => {}, 'local', 0)
    testOriginAndEnv('http://webui.ipfs.io.ipns.localhost:48080/', () => {}, 'local', 0) // brave
    testOriginAndEnv('http://localhost:3000/', () => { throw new Error('no match on origin') }, 'local', 1)
    testOriginAndEnv('http://127.0.0.1:3000/', () => { throw new Error('no match on origin') }, 'local', 1)
    testOriginAndEnv('https://some-random-url.localhost:3333', () => ({ redirected: false, url: 'https://some-random-url.localhost:3333/webui' }), 'local', 1)

    /**
     * Kubo webui endpoints
     */
    testOriginAndEnv('http://localhost:5001/webui', () => ({ redirected: true, url: 'http://localhost:5001/ipfs/bafybeiequgo72mrvuml56j4gk7crewig5bavumrrzhkqbim6b3s2yqi7ty/' }), 'kubo', 1)
    testOriginAndEnv('http://127.0.0.1:5002/webui', () => ({ redirected: true, url: 'http://127.0.0.1:5002/ipfs/bafybeiequgo72mrvuml56j4gk7crewig5bavumrrzhkqbim6b3s2yqi7ty/' }), 'kubo', 1)
    testOriginAndEnv('https://some-random-url.localhost:3333', () => ({ redirected: true, url: 'https://some-random-url.localhost:3333/ipfs/bafybeiequgo72mrvuml56j4gk7crewig5bavumrrzhkqbim6b3s2yqi7ty/' }), 'kubo', 1)
  })
})

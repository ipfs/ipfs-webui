import { test, expect } from './setup/coverage.js'
import { createController } from 'ipfsd-ctl'
import getPort from 'get-port'
import { createServer } from 'http'
import httpProxy from 'http-proxy'
import basicAuth from 'basic-auth'
import { multiaddrToUri as toUri } from '@multiformats/multiaddr-to-uri'
import { path as getGoIpfsPath } from 'kubo'
import * as kuboRpcModule from 'kubo-rpc-client'
const { createProxyServer } = httpProxy

test.describe('Remote API tests', () => {
  // Basic Auth Proxy Setup
  // -----------------------------------
  // Why do we support and test Basic Auth?
  // Some users choose to access remote API.
  // It requires setting up reverse proxy with correct CORS  and Basic Auth headers,
  // but when done properly, should work. This test sets up a proxy which
  // acts as properly protected and configured remote API to ensure there are no
  // regressions for this difficult to test use case.
  let ipfsd
  let proxyd
  let user
  let password
  let proxyPort

  let rpcMaddr
  let rpcUrl
  let rpcId

  test.beforeAll(async () => {
  // spawn an ephemeral local node to ensure we connect to a different, remote node
    ipfsd = await createController({
      type: 'go',
      ipfsBin: getGoIpfsPath(),
      kuboRpcModule,
      test: true,
      disposable: true
    })

    const { id } = await ipfsd.api.id()
    rpcId = id

    // set up proxy in front of remote API to provide CORS and Basic Auth
    user = 'user'
    password = 'pass'

    const proxy = createProxyServer()
    rpcMaddr = ipfsd.apiAddr.toString()
    const remoteApiUrl = toUri(rpcMaddr, { assumeHttp: true })
    rpcUrl = new URL(remoteApiUrl).toString() // normalization for browsers
    proxy.on('proxyReq', (proxyReq, req, res, options) => {
    // swap Origin before passing to the real API
    // This way internal check of kubo does get triggered (403 Forbidden on Origin mismatch)
      proxyReq.setHeader('Origin', remoteApiUrl)
      proxyReq.setHeader('Referer', remoteApiUrl)
      proxyReq.setHeader('Host', new URL(remoteApiUrl).host)
    })

    proxy.on('error', function (err, req, res) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(`proxyd error: ${JSON.stringify(err)}`)
    })

    proxyd = createServer((req, res) => {
    // console.log(`${req.method}\t\t${req.url}`)

      res.oldWriteHead = res.writeHead
      res.writeHead = function (statusCode, headers) {
      // hardcoded liberal CORS for easier testing
        res.setHeader('Access-Control-Allow-Origin', '*')
        // usual suspects + 'authorization' header
        res.setHeader('Access-Control-Allow-Headers', 'X-Stream-Output, X-Chunked-Output, X-Content-Length, authorization')
        res.oldWriteHead(statusCode)
      }

      const auth = basicAuth(req)
      const preflight = req.method === 'OPTIONS' // need preflight working
      if (!preflight && !(auth && auth.name === user && auth.pass === password)) {
        res.writeHead(401, {
          'WWW-Authenticate': 'Basic realm="IPFS API"'
        })
        res.end('Access denied')
      } else {
        proxy.web(req, res, { target: remoteApiUrl })
      }
    })
  })

  test.beforeEach(async ({ page }) => {
  // Swap API port for each test, ensure we don't get false-positives
    proxyPort = await getPort()
    await proxyd.listen(proxyPort)
    // remove default api port set in test/e2e/setup/global-setup.js
    await page.goto('/')
    await page.evaluate('localStorage.removeItem(\'ipfsApi\')')
  })

  test.afterEach(async () => {
    if (proxyd.listening) await proxyd.close()
  })

  test.afterAll(async () => {
    if (proxyd.listening) await proxyd.close()
    await ipfsd.stop()
  })

  const switchIpfsApiEndpointViaLocalStorage = async (endpoint, page) => {
    if (endpoint) {
      await page.evaluate(`localStorage.setItem('ipfsApi', '${endpoint}')`)
    } else {
      await page.evaluate('localStorage.removeItem(\'ipfsApi\')')
    }
    await waitForIpfsApiEndpoint(endpoint, page)
  }

  const switchIpfsApiEndpointViaSettings = async (endpoint, page) => {
    await page.click('[role="menubar"] a[href="#/settings"]')
    const selector = 'input[id="api-address"]'
    const locator = await page.locator(selector)
    await locator.fill(endpoint)
    await locator.press('Enter')
    await waitForIpfsApiEndpoint(endpoint, page)
  }

  const waitForIpfsApiEndpoint = async (endpoint, page) => {
    if (endpoint) {
      try {
      // unwrap port if JSON config is passed
        const json = JSON.parse(endpoint)
        const uri = new URL(json.url)
        endpoint = uri.port || endpoint
      } catch (_) {}
      try {
      // unwrap port if inlined basic auth was passed
      // (inlined URL is converted to JSON, so we cant do direct match)
        const uri = new URL(endpoint)
        if (uri.password) {
          endpoint = uri.port || endpoint
        }
      } catch (_) {}
      // await page.waitForFunction(`localStorage.getItem('ipfsApi') && localStorage.getItem('ipfsApi').includes('${endpoint}')`)
      await page.waitForFunction(endpoint => window.localStorage.getItem('ipfsApi') && window.localStorage.getItem('ipfsApi').includes(endpoint), endpoint)
      return
    }
    await page.waitForFunction(() => window.localStorage.getItem('ipfsApi') === null)
  }

  const basicAuthConnectionConfirmation = async (user, password, proxyPort, page, peerId) => {
  // (1) confirm API section on Status page includes expected PeerID and API description
  // account for JSON config, which we hide from status page
    await expectHttpApiAddressOnStatusPage('Custom JSON configuration', page)
    // confirm webui is actually connected to expected node :^)
    await expectPeerIdOnStatusPage(peerId, page)

    // (2) go to Settings and confirm API string includes expected JSON config
    const apiOptions = JSON.stringify({
      url: `http://127.0.0.1:${proxyPort}/`,
      headers: {
        authorization: `Basic ${nodeBtoa(user + ':' + password)}`
      }
    })
    await expectHttpApiAddressOnSettingsPage(apiOptions, page)
  }

  const expectPeerIdOnStatusPage = async (peerId, page) => {
    await page.goto('/#/')
    await page.reload() // instant addr update for faster CI
    await page.waitForSelector('summary')
    await page.click('summary')
    await page.waitForSelector(`text=${peerId}`)
  }

  const expectHttpApiAddressOnStatusPage = async (value, page) => {
    await page.goto('/#/')
    await page.reload() // instant addr update for faster CI
    await page.waitForSelector('summary')
    await page.click('summary')
    await page.waitForSelector(`div[id="http-api-address"]:has-text("${String(value)}")`)
  }

  const expectHttpApiAddressOnSettingsPage = async (value, page) => {
    await page.goto('/#/settings')
    await page.reload() // instant addr update for faster CI
    await page.waitForSelector('input[id="api-address"]')
    const apiAddrValue = await page.inputValue('#api-address')
    // if API address is defined as JSON, match objects
    try {
      const json = JSON.parse(apiAddrValue)
      const expectedJson = JSON.parse(value)
      await expect(json).toMatchObject(expectedJson)
      return
    } catch (_) {}
    // else, match strings (Multiaddr or URL)
    await expect(apiAddrValue).toEqual(String(value))
  }

  const nodeBtoa = (b) => Buffer.from(b).toString('base64')

  // ----------------------------------------------------------------------------
  // having that out of the way, tests begin below ;^)
  // ----------------------------------------------------------------------------

  test.describe('API @ multiaddr', () => {
    test('should be possible to set via Settings page', async ({ page }) => {
      await switchIpfsApiEndpointViaSettings(rpcMaddr, page)
      await expectPeerIdOnStatusPage(rpcId, page)
    })

    test('should show full multiaddr on Status page', async ({ page }) => {
      await switchIpfsApiEndpointViaSettings(rpcMaddr, page)
      await expectHttpApiAddressOnStatusPage(rpcMaddr, page)
      await expectPeerIdOnStatusPage(rpcId, page)
    })

    test('should show full multiaddr on Settings page', async ({ page }) => {
      await switchIpfsApiEndpointViaSettings(rpcMaddr, page)
      await expectHttpApiAddressOnSettingsPage(rpcMaddr, page)
    })
  })

  test.describe('API @ URL', () => {
    test('should be possible to set via Settings page', async ({ page }) => {
      await switchIpfsApiEndpointViaSettings(rpcUrl, page)
      await expectPeerIdOnStatusPage(rpcId, page)
    })

    test('should show full multiaddr on Status page', async ({ page }) => {
      await switchIpfsApiEndpointViaSettings(rpcUrl, page)
      await expectHttpApiAddressOnStatusPage(rpcUrl, page)
      await expectPeerIdOnStatusPage(rpcId, page)
    })

    test('should show full multiaddr on Settings page', async ({ page }) => {
      await switchIpfsApiEndpointViaSettings(rpcUrl, page)
      await expectHttpApiAddressOnSettingsPage(rpcUrl, page)
    })
  })

  test.describe('API with CORS and Basic Auth', () => {
    test.afterEach(async ({ page }) => {
      await switchIpfsApiEndpointViaLocalStorage(null, page)
    })

    test('should work when localStorage[ipfsApi] is set to URL with inlined Basic Auth credentials', async ({ page }) => {
      await switchIpfsApiEndpointViaLocalStorage(`http://${user}:${password}@127.0.0.1:${proxyPort}/`, page)
      await basicAuthConnectionConfirmation(user, password, proxyPort, page, rpcId)
    })

    test('should work when localStorage[ipfsApi] is set to a JSON string with a custom kubo-rpc-client config', async ({ page }) => {
      const apiOptions = JSON.stringify({
        url: `http://127.0.0.1:${proxyPort}/`,
        headers: {
          authorization: `Basic ${nodeBtoa(user + ':' + password)}`
        }
      })
      await switchIpfsApiEndpointViaLocalStorage(apiOptions, page)
      await basicAuthConnectionConfirmation(user, password, proxyPort, page, rpcId)
    })

    test('should work when URL with inlined credentials are entered at the Settings page', async ({ page }) => {
      const basicAuthApiAddr = `http://${user}:${password}@127.0.0.1:${proxyPort}/`
      await switchIpfsApiEndpointViaSettings(basicAuthApiAddr, page)
      await basicAuthConnectionConfirmation(user, password, proxyPort, page, rpcId)
    })

    test('should work when JSON with kubo-rpc-client config is entered at the Settings page', async ({ page }) => {
      const apiOptions = JSON.stringify({
        url: `http://127.0.0.1:${proxyPort}/`,
        headers: {
          authorization: `Basic ${nodeBtoa(user + ':' + password)}`
        }
      })
      await switchIpfsApiEndpointViaSettings(apiOptions, page)
      await basicAuthConnectionConfirmation(user, password, proxyPort, page, rpcId)
    })
  })
})

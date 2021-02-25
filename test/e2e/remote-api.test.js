/* global ipfs, webuiUrl, page, describe, it, expect, beforeAll */

const { createController } = require('ipfsd-ctl')
const getPort = require('get-port')
const http = require('http')
const httpProxy = require('http-proxy')
const basicAuth = require('basic-auth')
const toUri = require('multiaddr-to-uri')

// ipfs is a global 'local' node used for other tests,
// we reuse it for testing the most basic setup with no auth
const localIpfs = ipfs

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

beforeAll(async () => {
  await page.goto(webuiUrl)
  // spawn an ephemeral local node to ensure we connect to a different, remote node
  ipfsd = await createController({
    type: 'go',
    ipfsBin: require('go-ipfs').path(),
    ipfsHttpModule: require('ipfs-http-client'),
    test: true,
    disposable: true
  })

  // set up proxy in front of remote API to provide CORS and Basic Auth
  user = 'user'
  password = 'pass'

  const proxy = httpProxy.createProxyServer()
  const remoteApiUrl = toUri(ipfsd.apiAddr.toString(), { assumeHttp: true })
  proxy.on('proxyReq', (proxyReq, req, res, options) => {
    // swap Origin before passing to the real API
    // This way internal check of go-ipfs does get triggered (403 Forbidden on Origin mismatch)
    proxyReq.setHeader('Origin', remoteApiUrl)
    proxyReq.setHeader('Referer', remoteApiUrl)
    proxyReq.setHeader('Host', new URL(remoteApiUrl).host)
  })

  proxy.on('error', function (err, req, res) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end(`proxyd error: ${JSON.stringify(err)}`)
  })

  proxyd = http.createServer((req, res) => {
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

beforeEach(async () => {
  // Swap API port for each test, ensure we don't get false-positives
  proxyPort = await getPort()
  await proxyd.listen(proxyPort)
})

afterEach(async () => {
  if (proxyd.listening) await proxyd.close()
})

afterAll(async () => {
  if (proxyd.listening) await proxyd.close()
  await ipfsd.stop()
})

const switchIpfsApiEndpointViaLocalStorage = async (endpoint) => {
  if (endpoint) {
    await page.evaluate((a) => localStorage.setItem('ipfsApi', a), endpoint)
  } else {
    await page.evaluate(() => localStorage.removeItem('ipfsApi'))
  }
  await waitForIpfsApiEndpoint(endpoint)
}

const switchIpfsApiEndpointViaSettings = async (endpoint) => {
  await expect(page).toClick('a[href="#/settings"]')
  const selector = 'input[id="api-address"]'
  await page.waitForSelector(selector, { visible: true })
  await expect(page).toFill(selector, endpoint)
  await page.type(selector, '\n')
  await waitForIpfsApiEndpoint(endpoint)
}

const waitForIpfsApiEndpoint = async (endpoint) => {
  if (endpoint) {
    try {
      // unwrap port if JSON config is passed
      const json = JSON.parse(endpoint)
      endpoint = json.port || endpoint
    } catch (_) {}
    try {
      // unwrap port if inlined basic auth was passed
      // (inlined URL is converted to JSON, so we cant do direct match)
      const uri = new URL(endpoint)
      if (uri.password) {
        endpoint = uri.port || endpoint
      }
    } catch (_) {}
    await page.waitForFunction(`localStorage.getItem('ipfsApi') && localStorage.getItem('ipfsApi').includes('${endpoint}')`)
    return
  }
  await page.waitForFunction('localStorage.getItem(\'ipfsApi\') === null')
}

const basicAuthConnectionConfirmation = async (user, password, proxyPort) => {
  // (1) confirm API section on Status page includes expected PeerID and API description
  // account for JSON config, which we hide from status page
  await expectHttpApiAddressOnStatusPage('Custom JSON configuration')
  // confirm webui is actually connected to expected node :^)
  await expectPeerIdOnStatusPage(ipfsd.api)
  // (2) go to Settings and confirm API string includes expected JSON config
  const apiOptions = JSON.stringify({
    protocol: 'http',
    host: '127.0.0.1',
    port: `${proxyPort}`,
    headers: {
      authorization: `Basic ${nodeBtoa(user + ':' + password)}`
    }
  })
  await expectHttpApiAddressOnSettingsPage(apiOptions)
}

const expectPeerIdOnStatusPage = async (api) => {
  const { id } = await api.id()
  await expect(page).toMatch(id)
}

const expectHttpApiAddressOnStatusPage = async (value) => {
  await expect(page).toClick('a[href="#/"]')
  await page.reload() // instant addr update for faster CI
  await page.waitForSelector('summary', { visible: true })
  await expect(page).toClick('summary', { text: 'Advanced' })
  const apiAddressOnStatus = await page.waitForSelector('div[id="http-api-address"]', { visible: true })
  await expect(apiAddressOnStatus).toMatch(String(value))
}

const expectHttpApiAddressOnSettingsPage = async (value) => {
  await expect(page).toClick('a[href="#/settings"]')
  await page.waitForSelector('input[id="api-address"]', { visible: true })
  const apiAddrInput = await page.$('#api-address')
  const apiAddrValue = await page.evaluate(x => x.value, apiAddrInput)
  // if API address is defined as JSON, match objects
  try {
    const json = JSON.parse(apiAddrValue)
    const expectedJson = JSON.parse(value)
    return await expect(json).toMatchObject(expectedJson)
  } catch (_) {}
  // else, match strings (Multiaddr or URL)
  await expect(apiAddrValue).toMatch(String(value))
}

const nodeBtoa = (b) => Buffer.from(b).toString('base64')

// ----------------------------------------------------------------------------
// having that out of the way, tests begin below ;^)
// ----------------------------------------------------------------------------

describe('API @ multiaddr', () => {
  const localApiMultiaddr = `/ip4/${localIpfs.apiHost}/tcp/${localIpfs.apiPort}`

  it('should be possible to set via Settings page', async () => {
    await page.goto(webuiUrl + '#/settings')
    await switchIpfsApiEndpointViaSettings(localApiMultiaddr)
  })

  it('should show full multiaddr on Status page', async () => {
    await expectHttpApiAddressOnStatusPage(localApiMultiaddr)
    await expectPeerIdOnStatusPage(localIpfs)
  })

  it('should show full multiaddr on Settings page', async () => {
    await expectHttpApiAddressOnSettingsPage(localApiMultiaddr)
  })
})

describe('API @ URL', () => {
  const localApiUrl = new URL(`http://${localIpfs.apiHost}:${localIpfs.apiPort}`).toString()

  it('should be possible to set via Settings page', async () => {
    await switchIpfsApiEndpointViaSettings(localApiUrl)
  })

  it('should show full multiaddr on Status page', async () => {
    await expectHttpApiAddressOnStatusPage(localApiUrl)
    await expectPeerIdOnStatusPage(localIpfs)
  })

  it('should show full multiaddr on Settings page', async () => {
    await expectHttpApiAddressOnSettingsPage(localApiUrl)
  })
})

describe('API with CORS and Basic Auth', () => {
  it('should work when localStorage[ipfsApi] is set to URL with inlined Basic Auth credentials', async () => {
    await switchIpfsApiEndpointViaLocalStorage(`http://${user}:${password}@127.0.0.1:${proxyPort}`)
    await basicAuthConnectionConfirmation(user, password, proxyPort)
  })

  it('should work when localStorage[ipfsApi] is set to a JSON string with a custom ipfs-http-client config', async () => {
    const apiOptions = JSON.stringify({
      protocol: 'http',
      host: '127.0.0.1',
      port: `${proxyPort}`,
      headers: {
        authorization: `Basic ${nodeBtoa(user + ':' + password)}`
      }
    })
    await switchIpfsApiEndpointViaLocalStorage(apiOptions)
    await basicAuthConnectionConfirmation(user, password, proxyPort)
  })

  it('should work when URL with inlined credentials are entered at the Settings page', async () => {
    const basicAuthApiAddr = `http://${user}:${password}@127.0.0.1:${proxyPort}`
    await switchIpfsApiEndpointViaSettings(basicAuthApiAddr)
    await basicAuthConnectionConfirmation(user, password, proxyPort)
  })

  it('should work when JSON with ipfs-http-client config is entered at the Settings page', async () => {
    const apiOptions = JSON.stringify({
      protocol: 'http',
      host: '127.0.0.1',
      port: `${proxyPort}`,
      headers: {
        authorization: `Basic ${nodeBtoa(user + ':' + password)}`
      }
    })
    await switchIpfsApiEndpointViaSettings(apiOptions)
    await basicAuthConnectionConfirmation(user, password, proxyPort)
  })
})

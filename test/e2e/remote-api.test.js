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
let startProxyServer

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
  startProxyServer = async (port) => {
    return new Promise((resolve, reject) => {
      proxyd.on('listening', () => resolve())
      proxyd.on('error', (e) => reject(e))
      proxyd.listen(port)
    })
  }
})

beforeEach(async () => {
  // Swap API port for each test, ensure we don't get false-positives
  proxyPort = await getPort()
  await startProxyServer(proxyPort)
})

afterEach(async () => {
  await proxyd.close()
})

const switchIpfsApiEndpointViaLocalStorage = async (endpoint) => {
  await page.goto(webuiUrl)
  if (endpoint) {
    await page.evaluate((a) => localStorage.setItem('ipfsApi', a), endpoint)
  } else {
    await page.evaluate(() => localStorage.removeItem('ipfsApi'))
  }
  await waitForIpfsApiEndpoint(endpoint)
  await page.reload()
}
const switchIpfsApiEndpointViaSettings = async (endpoint) => {
  await page.goto(webuiUrl + '#/settings')
  const selector = 'input[id="api-address"]'
  await page.waitForSelector(selector)
  await page.evaluate(s => { document.querySelector(s).value = '' }, selector)
  await page.type(selector, endpoint)
  await page.keyboard.type('\n')
  await waitForIpfsApiEndpoint(endpoint)
  await page.reload()
}

const waitForIpfsApiEndpoint = async (endpoint) => {
  if (endpoint) {
    try {
      // unwrap API endpoint URL if JSON config is passed
      const json = JSON.parse(endpoint)
      endpoint = json.url || endpoint
    } catch (_) {}
    return page.waitForFunction(`localStorage.getItem('ipfsApi').includes('${endpoint}')`)
  }
  return page.waitForFunction('localStorage.getItem(\'ipfsApi\') === null')
}

const basicAuthConnectionConfirmation = async (proxyPort) => {
  // (1) confirm API section on Status page includes expected PeerID and API description
  // account for JSON config, which we hide from status page
  await expectHttpApiAddressOnStatusPage('Custom JSON configuration')
  // confirm webui is actually connected to expected node :^)
  await expectPeerIdOnStatusPage(ipfsd.api)
  // (2) go to Settings and confirm API string includes expected proxyPort
  await expectHttpApiAddressOnSettingsPage(proxyPort)
}

const expectPeerIdOnStatusPage = async (api) => {
  const { id } = await api.id()
  await expect(page).toMatch(id)
}

const expectHttpApiAddressOnStatusPage = async (value) => {
  const link = 'a[href="#/"]'
  await page.waitForSelector(link)
  await page.click(link)
  await page.waitForSelector('summary', { visible: true })
  await expect(page).toClick('summary', { text: 'Advanced' })
  const apiAddressOnStatus = await page.waitForSelector('div[id="http-api-address"]', { visible: true })
  await expect(apiAddressOnStatus).toMatch(String(value))
}

const expectHttpApiAddressOnSettingsPage = async (value) => {
  const settingsLink = 'a[href="#/settings"]'
  await page.waitForSelector(settingsLink)
  await page.click(settingsLink)
  await page.waitForSelector('input[id="api-address"]', { visible: true })
  const apiAddrInput = await page.$('#api-address')
  const apiAddrValue = await page.evaluate(x => x.value, apiAddrInput)
  await expect(apiAddrValue).toMatch(String(value))
}

const nodeBtoa = (b) => Buffer.from(b).toString('base64')

// ----------------------------------------------------------------------------
// having that out of the way, tests begin below ;^)
// ----------------------------------------------------------------------------

describe('API @ multiaddr', () => {
  const localApiMultiaddr = `/ip4/${localIpfs.apiHost}/tcp/${localIpfs.apiPort}`

  it('should be possible to set via Settings screen', async () => {
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

  it('should be possible to set via Settings screen', async () => {
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
    await basicAuthConnectionConfirmation(proxyPort)
  })

  it('should work when localStorage[ipfsApi] is set to a JSON string with a custom ipfs-http-client config', async () => {
    // options object accepted by the constructor of ipfs-http-client
    const apiOptions = JSON.stringify({
      url: `http://127.0.0.1:${proxyPort}/api/v0`,
      headers: {
        authorization: `Basic ${nodeBtoa(user + ':' + password)}`
      }
    })
    await switchIpfsApiEndpointViaLocalStorage(apiOptions)
    await basicAuthConnectionConfirmation(proxyPort)
  })

  it('should work when URL with inlined credentials is entered at the Settings screen', async () => {
    const basicAuthApiAddr = `http://${user}:${password}@127.0.0.1:${proxyPort}`
    await switchIpfsApiEndpointViaSettings(basicAuthApiAddr)
    await basicAuthConnectionConfirmation(proxyPort)
  })

  it('should work when JSON with ipfs-http-client config is entered at the Settings screen', async () => {
    const apiOptions = JSON.stringify({
      url: `http://127.0.0.1:${proxyPort}/api/v0`,
      headers: {
        authorization: `Basic ${nodeBtoa(user + ':' + password)}`
      }
    })
    await switchIpfsApiEndpointViaSettings(apiOptions)
    await basicAuthConnectionConfirmation(proxyPort)
  })

  afterAll(async () => {
    await ipfsd.stop()
  })
})

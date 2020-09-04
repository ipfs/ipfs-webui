/* global webuiUrl, page, waitForTitle, describe, it, expect, beforeAll */

const { createController } = require('ipfsd-ctl')
const getPort = require('get-port')
const http = require('http')
const httpProxy = require('http-proxy')
const basicAuth = require('basic-auth')
const toUri = require('multiaddr-to-uri')

// Why do we support and test Basic Auth?
// -----------------------------------
// Some users choose to access remote API.
// It requires setting up reverse proxy with correct CORS  and Basic Auth headers,
// but when done properly, should work. This test sets up a proxy which
// acts as properly protected and configured remote API to ensure there are no
// regressions for this difficult to test use case.

describe('Remote API with CORS and Basic Auth', () => {
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
    proxyPort = await getPort()
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
    await startProxyServer(proxyPort)
  })

  beforeEach(async () => {
    // set API endpoint to one without any service
    //  to avoid false-positives when running test on localhost with go-ipfs on default ports
    await switchIpfsApiEndpointViaLocalStorage(`/ip4/127.0.0.1/tcp/${await getPort()}`)
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
  const waitForIpfsApiEndpoint = async (endpoint) => {
    endpoint = (endpoint ? `'${endpoint}'` : 'null')
    await page.waitForFunction(`localStorage.getItem('ipfsApi') === ${endpoint}`)
  }
  const proxyConnectionConfirmation = async (proxyPort) => {
    // confirm API section  on Status pageincludes expected address
    const link = 'a[href="#/"]'
    await page.waitForSelector(link)
    await page.click(link)
    await waitForTitle('Status | IPFS')
    await page.waitForSelector('summary', { visible: true })
    await expect(page).toClick('summary', { text: 'Advanced' })
    await expect(page).toMatch(`http://127.0.0.1:${proxyPort}`)
    // confirm webui is actually connected to expected node :^)
    const { id } = await ipfsd.api.id()
    await expect(page).toMatch(id)
  }
  const nodeBtoa = (b) => Buffer.from(b).toString('base64')

  it('should work when localStorage[ipfsApi] is set to URL with inlined Basic Auth credentials', async () => {
    await switchIpfsApiEndpointViaLocalStorage(`http://${user}:${password}@127.0.0.1:${proxyPort}`)
    await proxyConnectionConfirmation(proxyPort)
  })

  it('should work when localStorage[ipfsApi] is set to a string with a custom ipfs-http-client config', async () => {
    // options object accepted by the constructor of ipfs-http-client
    const apiOptions = JSON.stringify({
      url: `http://127.0.0.1:${proxyPort}/api/v0`,
      headers: {
        authorization: `Basic ${nodeBtoa(user + ':' + password)}`
      }
    })
    await switchIpfsApiEndpointViaLocalStorage(apiOptions)
    await proxyConnectionConfirmation(proxyPort)
  })

  const switchIpfsApiEndpointViaSettings = async (endpoint) => {
    await page.goto(webuiUrl + '#/settings')
    const selector = 'input[id="api-address"]'
    await page.waitForSelector(selector)
    await page.evaluate(s => { document.querySelector(s).value = '' }, selector)
    await page.type(selector, endpoint)
    await page.keyboard.type('\n')
    // value could be a complex JSON, a partial match of unique port will do
    await page.waitForFunction(`localStorage.getItem('ipfsApi').includes(${String(proxyPort)})`)
    await page.reload()
  }

  it('should work when URL with inlined credentials is entered at the Settings screen', async () => {
    const basicAuthApiAddr = `http://${user}:${password}@127.0.0.1:${proxyPort}`
    await switchIpfsApiEndpointViaSettings(basicAuthApiAddr)
    await proxyConnectionConfirmation(proxyPort)
  })

  it('should work when JSON with ipfs-http-client config is entered at the Settings screen', async () => {
    const apiOptions = JSON.stringify({
      url: `http://127.0.0.1:${proxyPort}/api/v0`,
      headers: {
        authorization: `Basic ${nodeBtoa(user + ':' + password)}`
      }
    })
    await switchIpfsApiEndpointViaSettings(apiOptions)
    await proxyConnectionConfirmation(proxyPort)
  })

  afterAll(async () => {
    await Promise.all([ipfsd.stop(), proxyd.close()])
  })
})

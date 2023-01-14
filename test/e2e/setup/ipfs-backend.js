// const ipfsClient = require('ipfs-http-client')
const kuboRpcClient = require('kubo-rpc-client')

const Ctl = require('ipfsd-ctl')
const path = require('path')
const { console } = require('window-or-global')
const fs = require('fs')

async function run (rpcPort) {
  const endpoint = process.env.E2E_API_URL
  let ipfsd
  let ipfs
  if (endpoint) {
    // create http client for endpoint passed via E2E_API_URL=
    ipfs = kuboRpcClient.create(endpoint)
  } else {
    // use ipfds-ctl to spawn daemon to expose http api used for e2e tests
    const type = process.env.E2E_IPFSD_TYPE || 'go'
    const factory = Ctl.createFactory({
      kuboRpcClient,
      ipfsModule: require('ipfs'),
      type,
      ipfsOptions: {
        config: {
          Addresses: {
            API: `/ip4/127.0.0.1/tcp/${rpcPort}`
          }
        }
      },
      // sets up all CORS headers required for accessing HTTP API port of ipfsd node
      test: true
    },
    {
      go: {
        ipfsBin: process.env.IPFS_GO_EXEC || require('go-ipfs').path()
      },
      js: {
        ipfsBin: process.env.IPFS_JS_EXEC || path.resolve(__dirname, '../../../node_modules/ipfs/src/cli.js')
      }
    })

    ipfsd = await factory.spawn({ type })
    ipfs = ipfsd.api
  }
  const { id, agentVersion } = await ipfs.id()

  const { apiHost, apiPort } = ipfs

  if (String(apiPort) !== rpcPort) {
    console.error(`Invalid RPC port returned by IPFS backend: ${apiPort} != ${rpcPort}`)
    await ipfsd.stop()
    process.exit(1)
  }

  const rpcAddr = `/ip4/${apiHost}/tcp/${apiPort}`

  // persist details for e2e tests
  fs.writeFileSync(path.join(__dirname, 'ipfs-backend.json'), JSON.stringify({ rpcAddr, id, agentVersion }))

  console.log(`\nE2E using ${agentVersion} (${endpoint || ipfsd.exec}) with Peer ID ${id} at ${rpcAddr}\n`)

  const teardown = async () => {
    console.log(`Stopping IPFS backend ${id}`)
    await ipfsd.stop()
    process.exit(1)
  }
  process.stdin.resume()
  process.on('SIGINT', teardown)
}

run(process.argv[2])

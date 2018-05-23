import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import {quickSplitPath} from '../lib/path'
import {explainDagNode} from '../lib/dag'
import {findFirstLinkInPath} from '../lib/cbor'

/*
TODO:
  - this is dag-pg specific, we need dag-cbor and other flavours.
  - this uses the dag api not the object api so rename.
*/

/*
{
  path: '/ipfs/QmHash/foo/bar'
  resolved: {
    "data": { "type": "Buffer", "data": [8, 1] },
    "links": [
      {
        "name": "contact-ipfs",
        "size": 5814,
        "multihash": "QmXdUm5xgmmFK5ykH3Yvk2PFtL9eDs4FGJ9wpScXUMVsU1"
      },
    ],
    "multihash": "QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW",
    "size": 10016715
  }
}
*/
const bundle = createAsyncResourceBundle({
  name: 'object',
  actionBaseType: 'OBJECT',
  getPromise (args) {
    const {store, getIpfs} = args
    const hash = store.selectHash()
    const path = hash.replace('/explore', '')
    const {address, cidOrFqdn, rest} = quickSplitPath(path)
    return getIpfs().dag.get(address).then(async (res) => {
      if (!res.value) throw new Error('unpackDag expects an object with a `value` property as provided by an ipfs.dag.get response')
      let {value} = res
      const resolved = explainDagNode(value)
      if (resolved.type === 'dag-cbor') {
        if (!rest) {
          resolved.multihash = cidOrFqdn
        } else {
          // apply path to root obj, until you hit a link, or the end of the path
          const {value: rootNode} = await getIpfs().dag.get(cidOrFqdn)
          const cid = await findCid(getIpfs, rootNode, cidOrFqdn, rest)
          resolved.multihash = cid
        }
      }
      return {
        path,
        resolved,
        remainderPath: res.remainderPath
      }
    })
  },
  staleAfter: 100,
  checkIfOnline: false
})

bundle.reactObjectFetch = createSelector(
  'selectObjectShouldUpdate',
  'selectIpfsReady',
  'selectRouteInfo',
  'selectObject',
  (shouldUpdate, ipfsReady, {url, params}, obj) => {
    // console.log('reactObjectFetch', shouldUpdate, ipfsReady, url, params, obj)
    if (shouldUpdate && ipfsReady && url.startsWith('/explore') && params.path) {
      if (!obj || obj.path !== params.path) {
        return { actionCreator: 'doFetchObject' }
      }
    }
  }
)

export default bundle

async function findCid (getIpfs, node, rootCid, rest) {
  // until ipfs.dag.resolve is available, we have to walk the path to find the nearest cid.
  // dag.resolve https://github.com/ipfs/js-ipfs-api/pull/755#issuecomment-386882099
  const firstLinkCid = findFirstLinkInPath(node, rest)
  if (!firstLinkCid) {
    // we're in the right node.
    return rootCid
  } else {
    const {value: nextNode} = await getIpfs().dag.get(firstLinkCid)
    return findCid(getIpfs, nextNode, firstLinkCid, rest)
  }
}

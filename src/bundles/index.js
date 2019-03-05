import { composeBundles, createCacheBundle } from 'redux-bundler'
import ipfsBundle from 'ipfs-redux-bundle'
import { exploreBundle } from 'ipld-explorer-components'
import appIdle from './app-idle'
import nodeBandwidthChartBundle from './node-bandwidth-chart'
import nodeBandwidthBundle from './node-bandwidth'
import peersBundle from './peers'
import peerLocationsBundle from './peer-locations'
import routesBundle from './routes'
import redirectsBundle from './redirects'
import filesBundle from './files'
import configBundle from './config'
import configSaveBundle from './config-save'
import navbarBundle from './navbar'
import toursBundle from './tours'
import statsBundle from './stats'
import notifyBundle from './notify'
import connectedBundle from './connected'
import retryInitBundle from './retry-init'
import identityBundle from './identity'
import bundleCache from '../lib/bundle-cache'
import ipfsDesktop from './ipfs-desktop'
import repoStats from './repo-stats'
import createAnalyticsBundle from './analytics'

const COUNTLY_KEY_WEBUI = '8fa213e6049bff23b08e5f5fbac89e7c27397612'
const COUNTLY_KEY_DESKTOP = '47fbb3db3426d2ae32b3b65fe40c564063d8b55d'

export default composeBundles(
  createCacheBundle(bundleCache.set),
  appIdle({ idleTimeout: 5000 }),
  ipfsBundle({
    tryWindow: false,
    ipfsConnectionTest: (ipfs) => {
      // ipfs connection is working if can we fetch the bw stats.
      // See: https://github.com/ipfs-shipyard/ipfs-webui/issues/835#issuecomment-466966884
      return ipfs.stats.bw()
    }
  }),
  identityBundle,
  navbarBundle,
  routesBundle,
  redirectsBundle,
  statsBundle,
  toursBundle,
  filesBundle(),
  exploreBundle(async () => {
    const [
      // IPLD
      ipld,
      // IPLD Formats
      ipldBitcoin, ipldDagCbor, ipldDagPb, ipldGit, ipldRaw, ipldZcash,
      { ethAccountSnapshot, ethBlock, ethBlockList, ethStateTrie, ethStorageTrie, ethTxTrie, ethTx }
    ] = await Promise.all([
      import(/* webpackChunkName: "ipld" */ 'ipld'),
      import(/* webpackChunkName: "ipld" */ 'ipld-bitcoin'),
      import(/* webpackChunkName: "ipld" */ 'ipld-dag-cbor'),
      import(/* webpackChunkName: "ipld" */ 'ipld-dag-pb'),
      import(/* webpackChunkName: "ipld" */ 'ipld-git'),
      import(/* webpackChunkName: "ipld" */ 'ipld-raw'),
      import(/* webpackChunkName: "ipld" */ 'ipld-zcash'),
      import(/* webpackChunkName: "ipld" */ 'ipld-ethereum')
    ])

    return {
      ipld: ipld,
      formats: [
        ipldBitcoin, ipldDagCbor, ipldDagPb, ipldGit, ipldRaw, ipldZcash,
        ethAccountSnapshot, ethBlock, ethBlockList, ethStateTrie, ethStorageTrie, ethTxTrie, ethTx
      ]
    }
  }),
  configBundle,
  configSaveBundle,
  nodeBandwidthBundle,
  nodeBandwidthChartBundle(),
  peersBundle,
  peerLocationsBundle({ concurrency: 1 }),
  notifyBundle,
  connectedBundle,
  retryInitBundle,
  ipfsDesktop,
  repoStats,
  createAnalyticsBundle({
    countlyAppKey: window.ipfsDesktop ? COUNTLY_KEY_DESKTOP : COUNTLY_KEY_WEBUI,
    appVersion: process.env.REACT_APP_VERSION,
    appGitRevision: process.env.REACT_APP_GIT_REV
  })
)

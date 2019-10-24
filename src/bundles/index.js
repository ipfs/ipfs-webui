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
import notifyBundle from './notify'
import connectedBundle from './connected'
import retryInitBundle from './retry-init'
import identityBundle from './identity'
import bundleCache from '../lib/bundle-cache'
import ipfsDesktop from './ipfs-desktop'
import repoStats from './repo-stats'
import createAnalyticsBundle from './analytics'
import experimentsBundle from './experiments'

export default composeBundles(
  createCacheBundle({
    cacheFn: bundleCache.set
  }),
  appIdle({ idleTimeout: 5000 }),
  ipfsBundle({
    tryWindow: false,
    ipfsConnectionTest: async (ipfs) => {
      // ipfs connection is working if can we fetch the bw stats.
      // See: https://github.com/ipfs-shipyard/ipfs-webui/issues/835#issuecomment-466966884
      try {
        await ipfs.stats.bw()
      } catch (err) {
        if (!/bandwidth reporter disabled in config/.test(err)) {
          throw err
        }
      }

      return true
    }
  }),
  identityBundle,
  navbarBundle,
  routesBundle,
  redirectsBundle,
  toursBundle,
  filesBundle(),
  exploreBundle(),
  configBundle,
  configSaveBundle,
  nodeBandwidthBundle,
  nodeBandwidthChartBundle(),
  peersBundle,
  peerLocationsBundle(),
  notifyBundle,
  connectedBundle,
  retryInitBundle,
  experimentsBundle,
  ipfsDesktop,
  repoStats,
  createAnalyticsBundle({})
)

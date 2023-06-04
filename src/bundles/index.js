import { composeBundles, createCacheBundle } from 'redux-bundler'
import ipfsProvider from './ipfs-provider.js'
import { exploreBundle, heliaBundle } from 'ipld-explorer-components'
import appIdle from './app-idle.js'
import nodeBandwidthChartBundle from './node-bandwidth-chart.js'
import nodeBandwidthBundle from './node-bandwidth.js'
import peersBundle from './peers.js'
import peerLocationsBundle from './peer-locations.js'
import pinningBundle from './pinning.js'
import routesBundle from './routes.js'
import redirectsBundle from './redirects.js'
import filesBundle from './files/index.js'
import configBundle from './config.js'
import configSaveBundle from './config-save.js'
import toursBundle from './tours.js'
import notifyBundle from './notify.js'
import connectedBundle from './connected.js'
import retryInitBundle from './retry-init.js'
import identityBundle from './identity.js'
import bundleCache from '../lib/bundle-cache.js'
import ipfsDesktop from './ipfs-desktop.js'
import repoStats from './repo-stats.js'
import createAnalyticsBundle from './analytics.js'
import experimentsBundle from './experiments.js'
import cliTutorModeBundle from './cli-tutor-mode.js'
import gatewayBundle from './gateway.js'
import ipnsBundle from './ipns.js'

export default composeBundles(
  createCacheBundle({
    cacheFn: bundleCache.set
  }),
  appIdle({ idleTimeout: 5000 }),
  ipfsProvider,
  heliaBundle,
  identityBundle,
  routesBundle,
  redirectsBundle,
  toursBundle,
  filesBundle(),
  exploreBundle(),
  configBundle,
  configSaveBundle,
  gatewayBundle,
  nodeBandwidthBundle,
  nodeBandwidthChartBundle(),
  peersBundle,
  peerLocationsBundle(),
  pinningBundle,
  notifyBundle,
  connectedBundle,
  retryInitBundle,
  experimentsBundle,
  ipfsDesktop,
  repoStats,
  cliTutorModeBundle,
  createAnalyticsBundle({}),
  ipnsBundle
)

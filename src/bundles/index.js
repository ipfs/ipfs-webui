import { composeBundles, createCacheBundle } from 'redux-bundler'
import ipfsProvider from './ipfs-provider'
import { exploreBundle } from 'ipld-explorer-components'
import appIdle from './app-idle'
import nodeBandwidthChartBundle from './node-bandwidth-chart'
import nodeBandwidthBundle from './node-bandwidth'
import peersBundle from './peers'
import peerLocationsBundle from './peer-locations'
import pinningBundle from './pinning'
import routesBundle from './routes'
import redirectsBundle from './redirects'
import filesBundle from './files'
import configBundle from './config'
import configSaveBundle from './config-save'
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
import cliTutorModeBundle from './cli-tutor-mode'
import gatewayBundle from './gateway'
import ipnsBundle from './ipns'

export default composeBundles(
  createCacheBundle({
    cacheFn: bundleCache.set
  }),
  appIdle({ idleTimeout: 5000 }),
  ipfsProvider,
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

import { composeBundles, createCacheBundle } from 'redux-bundler'

import ipfsBundle from 'ipfs-redux-bundle'
import exploreBundle from './explore'
import appIdle from './app-idle'
import nodeBandwidthChartBundle from './node-bandwidth-chart'
import nodeBandwidthBundle from './node-bandwidth'
import peersBundle from './peers'
import peerBandwidthBundle from './peer-bandwidth'
import peerLocationsBundle from './peer-locations'
import routesBundle from './routes'
import redirectsBundle from './redirects'
import filesBundle from './files'
import configBundle from './config'
import configSaveBundle from './config-save'
import navbarBundle from './navbar'
import cache from '../utils/cache'

export default composeBundles(
  appIdle({ idleTimeout: 5000 }),
  createCacheBundle(cache.set),
  ipfsBundle(),
  exploreBundle,
  nodeBandwidthBundle,
  nodeBandwidthChartBundle(),
  peersBundle,
  peerBandwidthBundle(),
  peerLocationsBundle(),
  routesBundle,
  redirectsBundle,
  filesBundle(),
  configBundle,
  configSaveBundle,
  navbarBundle
)

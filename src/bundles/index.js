import { composeBundles } from 'redux-bundler'

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
import statsBundle from './stats'
import notifyBundle from './notify'
import connectedBundle from './connected'

export default composeBundles(
  appIdle({ idleTimeout: 5000 }),
  ipfsBundle(),
  navbarBundle,
  routesBundle,
  redirectsBundle,
  statsBundle,
  filesBundle(),
  exploreBundle,
  configBundle,
  configSaveBundle,
  nodeBandwidthBundle,
  nodeBandwidthChartBundle(),
  peersBundle,
  peerLocationsBundle(),
  notifyBundle,
  connectedBundle
)

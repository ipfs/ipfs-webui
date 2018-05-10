import { composeBundles } from 'redux-bundler'
import ipfsBundle from './ipfs'
import peersBundle from './peers'
import routesBundle from './routes'
import liveUpdateBundle from './live-update'

export default composeBundles(
  ipfsBundle,
  peersBundle,
  routesBundle,
  liveUpdateBundle
)

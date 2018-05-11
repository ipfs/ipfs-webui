import { composeBundles } from 'redux-bundler'
import ipfsBundle from './ipfs'
import peersBundle from './peers'
import routesBundle from './routes'
import appIdle from './app-idle'

export default composeBundles(
  ipfsBundle,
  peersBundle,
  routesBundle,
  appIdle({idleTimeout: 5000})
)

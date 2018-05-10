import { composeBundles } from 'redux-bundler'
import ipfsBundle from './ipfs'
import peersBundle from './peers'
import routesBundle from './routes'

export default composeBundles(
  ipfsBundle,
  peersBundle,
  routesBundle
)

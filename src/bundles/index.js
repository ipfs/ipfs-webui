import { composeBundles, debugBundle, appTimeBundle, onlineBundle } from 'redux-bundler'
import ipfsBundle from './ipfs'
import peersBundle from './peers'

export default composeBundles(
  debugBundle,
  appTimeBundle,
  onlineBundle,
  ipfsBundle,
  peersBundle
)

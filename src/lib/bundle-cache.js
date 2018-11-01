import { getConfiguredCache } from 'money-clip'

const bundleCache = getConfiguredCache({
  name: 'bundle-cache',
  version: 1,
  maxAge: Infinity
})

export default bundleCache

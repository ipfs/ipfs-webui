import { getConfiguredCache } from 'money-clip'

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// Wraps the bundler with a caching object that allows the user to
// write and read from the IndexedDB.
//
// It adds a selector called select{BundleName}Cache which returns
// a cache object containing the following functions:
//
//  - getAll() -> Promise
//  - get(key) -> Promise
//  - set(key, value) -> Promise
//  - clear(key) -> Promise
//
// More info: https://github.com/HenrikJoreteg/money-clip#api
export default (bundle) => {
  let opts = bundle.cacheOpts || {}

  const cache = getConfiguredCache({
    ...opts,
    name: bundle.name
  })

  bundle[`select${capitalize(bundle.name)}Cache`] = () => cache
  return bundle
}

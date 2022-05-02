import React from 'react'
import { Provider } from 'redux-bundler-react'
import { composeBundlesRaw } from 'redux-bundler'

// bundle is an object with a `name` and at least one `select*` property
const bundleDecorator = (bundle) => (story) => {
  const store = composeBundlesRaw(bundle)()
  return (
    <Provider store={store}>
      {story()}
    </Provider>
  )
}

export default bundleDecorator

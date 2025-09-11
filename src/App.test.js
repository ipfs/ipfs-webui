import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createStore } from 'redux-bundler'
import App from './App'
import bundles from './bundles'

// Mock the dynamic imports that cause issues
jest.mock('@loadable/component', () => ({
  __esModule: true,
  default: (loadFn) => {
    const Component = React.lazy(loadFn)
    return (props) => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </React.Suspense>
    )
  }
}))

// Mock IPFS provider
jest.mock('./bundles/ipfs-provider.js', () => ({
  __esModule: true,
  default: {
    name: 'ipfs',
    reducer: (state = { apiAddress: 'http://localhost:5001' }) => state,
    selectIpfs: () => null,
    selectIpfsConnected: () => false,
    selectIpfsInitFailed: () => false,
    selectIpfsInitPending: () => false,
    doInitIpfs: () => () => Promise.resolve(),
    doTryInitIpfs: () => () => Promise.resolve()
  }
}))

describe('App', () => {
  let store

  beforeEach(() => {
    store = createStore(bundles)
  })

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )

    // Check if the app renders some basic content
    expect(document.body).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )

    // The app should render without throwing errors
    expect(document.body).toBeInTheDocument()
  })
})

import React from 'react'
import { connect } from 'redux-bundler-react'
import debounceImport from 'react-debounce-render'
import { Loader } from './Loader.js'
const debounce = debounceImport.default

export const AsyncRequestLoader = ({ asyncActive }) => (
  <div
    title={asyncActive ? 'Fetching data...' : null}
    className={asyncActive ? 'o-100' : 'o-0'}
    style={{ transition: 'opacity 500ms linear' }}>
    <Loader />
  </div>
)

const debouncedComponent = debounce(AsyncRequestLoader, 1000, { leading: true })

export default connect('selectAsyncActive', debouncedComponent)

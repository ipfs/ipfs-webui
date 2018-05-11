import React from 'react'
import { connect } from 'redux-bundler-react'
import { Loader } from './Loader'

export const AsyncRequestLoader = ({asyncActive}) => {
  return asyncActive ? <Loader title='Fetching data...' /> : null
}

export default connect('selectAsyncActive', AsyncRequestLoader)

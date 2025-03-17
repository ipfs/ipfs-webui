import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/component-loader.js'

const LoadableStatusPage = Loadable(() => import('./status-page.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableStatusPage

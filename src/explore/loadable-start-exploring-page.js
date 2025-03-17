import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/component-loader.js'

const LoadableStartExploringPage = Loadable(() => import('./start-exploring-container.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableStartExploringPage

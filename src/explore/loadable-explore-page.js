import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/component-loader.js'

const LoadableExplorePage = Loadable(() => import('./explore-container.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableExplorePage

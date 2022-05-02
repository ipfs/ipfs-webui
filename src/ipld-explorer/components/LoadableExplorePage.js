import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from './loader/ComponentLoader.js'

const LoadableExplorePage = Loadable(() => import('./ExplorePage'),
  { fallback: <ComponentLoader/> }
)

export default LoadableExplorePage

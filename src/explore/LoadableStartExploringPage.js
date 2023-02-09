import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableStartExploringPage = Loadable(() => import('./StartExploringContainer.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableStartExploringPage

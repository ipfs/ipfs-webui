import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/component-loader.js'

const LoadablePeersPage = Loadable(() => import('./peers-page.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadablePeersPage

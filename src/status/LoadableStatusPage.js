import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableStatusPage = Loadable(() => import('./StatusPage.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableStatusPage

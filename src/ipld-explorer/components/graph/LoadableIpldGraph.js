import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableSettingsPage = Loadable(() => import('./IpldGraphCytoscape'),
  { fallback: <ComponentLoader/> }
)

export default LoadableSettingsPage

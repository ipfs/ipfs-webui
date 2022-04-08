import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadablePinsPage = Loadable(() => import('./PinsPage'),
  { fallback: <ComponentLoader/> }
)

export default LoadablePinsPage

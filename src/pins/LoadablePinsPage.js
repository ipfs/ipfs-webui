import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadablePinsPage = Loadable(() => import('./PinsPage.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadablePinsPage

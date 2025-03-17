import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/component-loader.js'

const LoadablePinsPage = Loadable(() => import('./pins-page.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadablePinsPage

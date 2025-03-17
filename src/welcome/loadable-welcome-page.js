import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/component-loader.js'

const LoadableWelcomePage = Loadable(() => import('./welcome-page.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableWelcomePage

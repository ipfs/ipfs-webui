import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableWelcomePage = Loadable(() => import('./WelcomePage.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableWelcomePage

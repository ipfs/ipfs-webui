import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableStartSearchingPage = Loadable(() => import('./StartSearchingContainer'),
  { fallback: <ComponentLoader/> }
)

export default LoadableStartSearchingPage

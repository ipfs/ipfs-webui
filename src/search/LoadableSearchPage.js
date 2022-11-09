import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableSearchPage = Loadable(() => import('./SearchPage'),
  { fallback: <ComponentLoader/> }
)

export default LoadableSearchPage

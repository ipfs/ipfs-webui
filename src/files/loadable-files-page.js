import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/component-loader.js'

const LoadableFilesPage = Loadable(() => import('./files-page.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableFilesPage

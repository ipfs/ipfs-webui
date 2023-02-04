import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableFilesPage = Loadable(() => import('./FilesPage.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableFilesPage

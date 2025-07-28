import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableDiagnosticsPage = Loadable(() => import('./diagnostics-page'),
  { fallback: <ComponentLoader/> }
)

export default LoadableDiagnosticsPage

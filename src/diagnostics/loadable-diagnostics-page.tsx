import React from 'react'
// @ts-expect-error - ComponentLoader is not typed
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableDiagnosticsPage = Loadable(() => import('./diagnostics-page'),
  { fallback: <ComponentLoader/> }
)

export default LoadableDiagnosticsPage

import React from 'react'
import Loadable from '@loadable/component'
import ComponentLoader from '../loader/component-loader.js'

const LoadableSettingsPage = Loadable(() => import('./settings-page.js'),
  { fallback: <ComponentLoader/> }
)

export default LoadableSettingsPage

import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableSettingsPage = Loadable(() => import('./SettingsPage'),
  { fallback: <ComponentLoader/> }
)

export default LoadableSettingsPage

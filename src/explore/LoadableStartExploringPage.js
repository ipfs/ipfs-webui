import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableStartExploringPage = Loadable(() => import('./StartExploringContainer'),
  { fallback: <ComponentLoader/> }
)

export default LoadableStartExploringPage

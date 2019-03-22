import Loadable from 'react-loadable'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableStartExploringPage = Loadable({
  loader: () => import('./StartExploringContainer'),
  loading: ComponentLoader
})

export default LoadableStartExploringPage

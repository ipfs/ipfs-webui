import Loadable from 'react-loadable'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadablePeersPage = Loadable({
  loader: () => import('./PeersPage'),
  loading: ComponentLoader
})

export default LoadablePeersPage

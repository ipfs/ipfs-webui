import Loadable from 'react-loadable'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableExplorePage = Loadable({
  loader: () => import('./ExplorePage'),
  loading: ComponentLoader
})

export default LoadableExplorePage

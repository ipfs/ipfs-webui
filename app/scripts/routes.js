import React from 'react'
import {Route, IndexRoute, Redirect} from 'react-router'

import App from './containers/app'
import HomePage from './containers/home'
import ConnectionsPage from './pages/connections'
import FilesPage from './pages/files'
import ObjectsPage from './pages/objects'
import BitswapPage from './pages/bitswap'
import RoutingPage from './pages/routing'
import ConfigPage from './pages/config'
import LogPage from './containers/logs'
import NotFoundPage from './pages/notfound'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={HomePage}/>
    <Route path='home' component={HomePage} />

    <Route path='connections' component={ConnectionsPage} />
    <Route path='files' component={FilesPage} />
    <Route path='files/pinned' component={FilesPage} />
    <Route path='objects(/:path)' component={ObjectsPage} />
    <Route path='bitswap' component={BitswapPage} />
    <Route path='routing' component={RoutingPage} />
    <Route path='config' component={ConfigPage} />
    <Route path='logs' component={LogPage} />

    <Route path='*' component={NotFoundPage} />
    <Redirect from='/index.html' to='/home' />
  </Route>
)

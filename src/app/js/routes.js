import React from 'react'
import {Route, IndexRoute, Redirect} from 'react-router'

import App from './containers/app'
import FilesPage from './containers/files'
import FilesPreviewPage from './containers/files-preview'
import NotFoundPage from './components/not-found'

/* Legacy pages */
import HomePage from './pages/home'
import ConnectionsPage from './pages/connections'
import ObjectsPage from './pages/objects'
import BitswapPage from './pages/bitswap'
import RoutingPage from './pages/routing'
import ConfigPage from './pages/config'
import LogPage from './pages/logs'

export
default (
  <Route path='/' component={App}>
    <IndexRoute component={HomePage} />
    <Route path='home' component={HomePage} />
    <Route path='connections' component={ConnectionsPage} />
    <Route path='files' component={FilesPage}>
      <Route path='preview' component={FilesPreviewPage} />
    </Route>
    <Route path='objects(/:path)' component={ObjectsPage} />
    <Route path='bitswap' component={BitswapPage} />
    <Route path='routing' component={RoutingPage} />
    <Route path='config' component={ConfigPage} />
    <Route path='logs' component={LogPage} />
    <Route path='*' component={NotFoundPage} />
    <Redirect from='/index.html' to='/home' />
  </Route>
)

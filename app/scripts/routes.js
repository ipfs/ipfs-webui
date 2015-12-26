import React from 'react'
import {Route, DefaultRoute, NotFoundRoute, Redirect} from 'react-router'

import Page from './views/page'
import HomePage from './pages/home'
import ConnectionsPage from './pages/connections'
import FilesPage from './pages/files'
import ObjectsPage from './pages/objects'
import BitswapPage from './pages/bitswap'
import RoutingPage from './pages/routing'
import ConfigPage from './pages/config'
import LogPage from './pages/logs'
import NotFoundPage from './pages/notfound'

require('../styles/bundle.less')

module.exports = (
  <Route handler={Page} path='/'>
    <DefaultRoute name='home' handler={HomePage} />
    <Route name='connections' handler={ConnectionsPage} />
    <Route name='files' handler={FilesPage} />
    <Route name='files-pinned' path='/files/pinned' handler={FilesPage} />
    <Route name='files-all' path='/files/all' handler={FilesPage} />
    <Route name='objects' path='/objects/:tab/:path?' handler={ObjectsPage} />
    <Route name='bitswap' handler={BitswapPage} />
    <Route name='routing' handler={RoutingPage} />
    <Route name='config' handler={ConfigPage} />
    <Route name='logs' handler={LogPage} />
    <NotFoundRoute handler={NotFoundPage} />
    <Redirect from='/index.html' to='home' />
  </Route>
)

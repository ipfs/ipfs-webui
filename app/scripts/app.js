var React = require('react')
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var NotFoundRoute = Router.NotFoundRoute
var Redirect = Router.Redirect
var Page = require('./views/page')
var HomePage = require('./pages/home')
var ConnectionsPage = require('./pages/connections')
var FilesPage = require('./pages/files')
var ObjectsPage = require('./pages/objects')
var BitswapPage = require('./pages/bitswap')
var RoutingPage = require('./pages/routing')
var ConfigPage = require('./pages/config')
var LogPage = require('./pages/logs')
var NotFoundPage = require('./pages/notfound')

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

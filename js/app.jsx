var React = require('react')
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var NotFoundRoute = Router.NotFoundRoute
var Redirect = Router.Redirect
var Page = require('./views/page.jsx')
var HomePage = require('./pages/home.jsx')
var ConnectionsPage = require('./pages/connections.jsx')
var FilesPage = require('./pages/files.jsx')
var ObjectsPage = require('./pages/objects.jsx')
var BitswapPage = require('./pages/bitswap.jsx')
var ConfigPage = require('./pages/config.jsx')
var NotFoundPage = require('./pages/notfound.jsx')

module.exports = (
  <Route handler={Page} path="/webui">
    <DefaultRoute name="home" handler={HomePage} />
    <Route name="connections" handler={ConnectionsPage} />
    <Route name="files" handler={FilesPage} />
    <Route name="objects" handler={ObjectsPage} />
    <Route name="object" path="/objects/:hash" handler={ObjectsPage} />
    <Route name="bitswap" handler={BitswapPage} />
    <Route name="config" handler={ConfigPage} />
    <NotFoundRoute handler={HomePage} />
    <Redirect from="/index.html" to="home" />
  </Route>
)

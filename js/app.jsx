var React = require('react')
var Router = require('react-router')
var Routes = Router.Routes
var Route = Router.Route
var NotFound = Router.NotFoundRoute
var Redirect = Router.Redirect
var Page = require('./views/page.jsx')
var HomePage = require('./pages/home.jsx')
var ConnectionsPage = require('./pages/connections.jsx')
var FilesPage = require('./pages/files.jsx')
var ObjectsPage = require('./pages/objects.jsx')
var ConfigPage = require('./pages/config.jsx')
var NotFoundPage = require('./pages/notfound.jsx')
var ipfs = require('ipfs-api')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      // TODO: get this address from a config
      ipfs: ipfs('localhost', 5001)
    }
  },

  render: function() {

    return (
      <Page ipfs={this.state.ipfs}>
        <Routes location="history">
          <Route name="home" path="/" handler={HomePage} ipfs={this.state.ipfs} />
          <Route name="connections" path="/connections" handler={ConnectionsPage} ipfs={this.state.ipfs} />
          <Route name="files" path="/files" handler={FilesPage} ipfs={this.state.ipfs} />
          <Route name="objects" path="/objects" handler={ObjectsPage} ipfs={this.state.ipfs} />
          <Route name="object" path="/objects/:hash" handler={ObjectsPage} ipfs={this.state.ipfs} />
          <Route name="config" path="/config" handler={ConfigPage} ipfs={this.state.ipfs} />
          <NotFound handler={NotFoundPage} />
          <Redirect path="/index.html" to="home" />
        </Routes>
      </Page>
    )
  }
})

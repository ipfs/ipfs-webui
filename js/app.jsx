var React = require('react')
var Router = require('react-router')
var Routes = Router.Routes
var Route = Router.Route
var NotFound = Router.NotFoundRoute
var Redirect = Router.Redirect
var Page = require('./views/page.jsx')
var HomePage = require('./pages/home.jsx')
var PeersPage = require('./pages/peers.jsx')
var FilesPage = require('./pages/files.jsx')
var NotFoundPage = require('./pages/notfound.jsx')
var ipfsRpc = window.ipfsRpc || require('ipfs-rpc')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      // TODO: get this address from a config
      // TODO: use HTTP RPC for web compatibility
      ipfs: ipfsRpc('/ip4/127.0.0.1/tcp/5001')
    }
  },

  render: function() {

    return (
      <Page>
        <Routes location="history">
          <Route name="home" path="/" handler={HomePage} />
          <Route name="peers" path="/peers" handler={PeersPage} />
          <Route name="files" path="/files" handler={FilesPage} ipfs={this.state.ipfs} />
          <NotFound handler={NotFoundPage} />
          <Redirect path="/index.html" to="home" />
        </Routes>
      </Page>
    )
  }
})

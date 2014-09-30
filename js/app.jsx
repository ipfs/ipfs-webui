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

module.exports = React.createClass({
  render: function() {

    return (
      <Page>
        <Routes location="history">
          <Route name="home" path="/" handler={HomePage} />
          <Route name="peers" path="/peers" handler={PeersPage} />
          <Route name="files" path="/files" handler={FilesPage} />
          <NotFound handler={NotFoundPage} />
          <Redirect path="/index.html" to="home" />
        </Routes>
      </Page>
    )
  }
})

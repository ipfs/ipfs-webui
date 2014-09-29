var React = require('react')
var Router = require('react-router')
var Routes = Router.Routes
var Route = Router.Route
var NotFound = Router.NotFoundRoute
var Page = require('./views/page.jsx')
var HomePage = require('./pages/home.jsx')
var PeersPage = require('./pages/peers.jsx')
var NotFoundPage = require('./pages/notfound.jsx')

module.exports = React.createClass({
  render: function() {

    return (
      <Page>
        <Routes location="history">
          <Route name="home" path="/" handler={HomePage} />
          <Route name="peers" path="/peers" handler={PeersPage} />
          <NotFound handler={NotFoundPage} />
        </Routes>
      </Page>
    )
  }
})

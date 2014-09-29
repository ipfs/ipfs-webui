var React = require('react')
var Router = require('react-router-component')
var Locations = Router.Locations
var Location = Router.Location
var NotFound = Router.NotFound
var Page = require('./views/page.jsx')
var HomePage = require('./pages/home.jsx')
var PeersPage = require('./pages/peers.jsx')
var NotFoundPage = require('./pages/notfound.jsx')

module.exports = React.createClass({
  render: function() {

    return (
      <Page>
        <Locations>
          <Location path="/" handler={HomePage} />
          <Location path="/peers" handler={PeersPage} />
          <NotFound handler={NotFoundPage} />
        </Locations>
      </Page>
    )
  }
})

var React = require('react')
var Nav = require('../views/nav.jsx')

module.exports = React.createClass({
  render: function() {
    return (
  <div className="row">
    <div className="col-sm-10 col-sm-offset-1">

      <Nav />

      <h1>404 - Not Found</h1>

      <p><a href="/">Go to console home</a></p>

    </div>
  </div>
    )
  }
})

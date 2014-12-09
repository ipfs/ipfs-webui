var React = require('react')
var Router = require('react-router')
var Nav = require('../views/nav.jsx')
var Config = require('../views/config.jsx')

module.exports = React.createClass({
  getInitialState: function() {
    var t = this
    t.props.ipfs.config.show(function(err, config) {
      console.log(err, config)
      if(!err) t.setState({ config: config })
    })

    return { config: null }
  },

  render: function() {
    var config = this.state.config ? Config(this.state.config) : null

    return (
      <div className="row">
        <div className="col-sm-10 col-sm-offset-1">

          <Nav activeKey={5} />

          {config}
        </div>
      </div>
    )
  }
})

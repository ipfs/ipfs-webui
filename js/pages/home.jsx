var React = require('react')
var Nav = require('../views/nav.jsx')
var NodeProps = require('../views/nodeprops.jsx')
var TabbedArea = require('react-bootstrap/TabbedArea')
var TabPane = require('react-bootstrap/TabPane')

module.exports = React.createClass({
  getInitialState: function() {
    var t = this
    var id = t.props.ipfs.id(function(err, id) {
      console.log(id)
      if(!err) t.setState(id)
    });

    return {
      ID: '',
      Addresses: [],
      AgentVersion: ''
    }
  },

  render: function() {
    return (
  <div className="row">
    <div className="col-sm-8 col-sm-offset-2">

      <Nav activeKey={1} />

      <h3>Node Info</h3>
      <div className="panel panel-default">
        {NodeProps({
          node: {
            id: this.state.ID,
            address: this.state.Addresses[this.state.Addresses.length-1],
            version: this.state.AgentVersion,
          }
        })}
      </div>

    </div>
  </div>
    )
  }
})

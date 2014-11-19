var React = require('react')
var Nav = require('../views/nav.jsx')
var NodeProps = require('../views/nodeprops.jsx')
var Table = require('../views/table.jsx')
var TabbedArea = require('react-bootstrap/TabbedArea')
var TabPane = require('react-bootstrap/TabPane')

module.exports = React.createClass({
  getInitialState: function() {
    var t = this
    var id = t.props.ipfs.id(function(err, id) {
      console.log(id)
      if(err || !id) return console.error(err)
      t.setState(id)
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
    <div className="col-sm-10 col-sm-offset-1">

      <Nav activeKey={1} />

      <h3>Node Info</h3>
      <div className="panel panel-default">
        {NodeProps(this.state)}
      </div>

      <h4>Network Addresses</h4>
      <div className="panel panel-default">
        {Table({ table: this.state.Addresses })}
      </div>

    </div>
  </div>
    )
  }
})

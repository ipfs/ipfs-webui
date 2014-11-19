var React = require('react')
var PropTable = require('./proptable.jsx')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    var node = this.props.node
    var table = [
      ["Node ID", addr(node.id)],
      ["Address", addr(node.address)],
      ["Version", addr(node.version)],
    ]

    return PropTable({table: table})
  }
})

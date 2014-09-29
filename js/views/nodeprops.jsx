var React = require('react')
var PropTable = require('./proptable.jsx')
var addr = require('./typography.jsx').addr

module.exports = React.createClass({

  render: function() {
    var node = this.props.node
    var table = [
      ["Node ID", addr(node.id)],
      ["Address", addr(node.address)],
    ]

    return PropTable({table: table})
  }
})

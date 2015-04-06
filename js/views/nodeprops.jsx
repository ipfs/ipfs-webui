var React = require('react')
var PropTable = require('./proptable.jsx')
var addr = require('./typography.jsx').addr

var NodeProps = React.createClass({

  render: function () {
    var node = this.props || {}
    console.log(node)
    var table = [
      ['Node ID', addr(node.ID)],
      ['Version', addr(node.AgentVersion)]
    ]

    return PropTable({ table: table })
  }
})

module.exports = NodeProps

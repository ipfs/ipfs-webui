var React = require('react')
var PropTable = require('./proptable.jsx')

module.exports = React.createClass({

  render: function() {
    var node = this.props.node
    var table = [
      ["Node ID", node.id],
      ["Address", node.address],
    ]

    return PropTable({table: table})
  }
})

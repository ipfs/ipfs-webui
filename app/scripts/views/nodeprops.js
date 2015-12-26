import React from 'react'
import PropTable from './proptable'
import {addr} from './typography'

export default React.createClass({
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

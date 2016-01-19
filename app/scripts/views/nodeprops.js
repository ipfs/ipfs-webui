import React from 'react'
import PropTable from './proptable'
import {addr} from './typography'

export
default class NodeProps extends React.Component {
  render () {
    const node = this.props || {}

    const table = [
      ['Node ID', addr(node.ID)],
      ['Version', addr(node.AgentVersion)]
    ]

    return PropTable({
      table
    })
  }
}

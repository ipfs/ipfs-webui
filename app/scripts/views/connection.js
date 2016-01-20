import React, {Component, PropTypes} from 'react'

export
default class Connection extends Component {
  static displayName = 'Connection';
  static propTypes = {
    ID: PropTypes.string,
    Address: PropTypes.string,
    AgentVersion: PropTypes.string,
    ProtocolVersion: PropTypes.string
  };

  render () {
    return (
      <tr>
        <td>{this.props.ID.substring(2, 10)}</td>
        <td>{this.props.Address}</td>
        <td>{this.props.AgentVersion}</td>
        <td>{this.props.ProtocolVersion}</td>
      </tr>
    )
  }
}

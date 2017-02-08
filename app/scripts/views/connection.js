import React, {Component} from 'react'
import Peer from './peer'

export
default class Connection extends Component {
  static displayName = 'Connection';
  static propTypes = {
    ipfs: React.PropTypes.object,
    location: React.PropTypes.object,
    bytesRead: React.PropTypes.number,
    bytesWritten: React.PropTypes.number,
    peer: React.PropTypes.object,
    addr: React.PropTypes.object
  };

  state = {
    open: false
  };

  _handleClick = () => {
    if (this.state.open) {
      return this.setState({
        open: false
      })
    }

    const id = this.props.peer.toB58String()
    this.props.ipfs.id(id, (err, peer) => {
      if (err) return console.error(err)
      this.setState({
        open: true,
        peer
      })
    })
  };

  render () {
    let peer = ''

    if (this.state.open) {
      peer = (
        <Peer
          peer={this.state.peer}
          location={this.props.location}
          bytesRead={this.props.bytesRead}
          bytesWritten={this.props.bytesWritten}
        />
      )
    }

    const id = this.props.peer.toB58String()
    return (
      <li className={'webui-connection list-group-item ' + (this.state.open ? 'active' : '')}>
        <button className='btn btn-link' onClick={this._handleClick}>
          <strong>{id}</strong>
          <br />
          <span>{this.props.addr.toString()}</span>
          <i className='icon fa fa-lg fa-angle-down' />
        </button>
        {peer}
      </li>
    )
  }
}

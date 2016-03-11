import React, {Component} from 'react'
import Peer from './peer'

export
default class Connection extends Component {
  static displayName = 'Connection';
  static propTypes = {
    ipfs: React.PropTypes.object,
    location: React.PropTypes.object,
    BytesRead: React.PropTypes.number,
    BytesWritten: React.PropTypes.number,
    ID: React.PropTypes.string,
    Address: React.PropTypes.string
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
    this.props.ipfs.id(this.props.ID, (err, peer) => {
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
          bytesRead={this.props.BytesRead}
          bytesWritten={this.props.BytesWritten}
        />
      )
    }

    return (
      <li className={'webui-connection list-group-item ' + (this.state.open ? 'active' : '')}>
        <button className='btn btn-link' onClick={this._handleClick}>
          <strong>{this.props.ID}</strong>
          <br/>
          <span>{this.props.Address}</span>
          <i className='icon fa fa-lg fa-angle-down'></i>
        </button>
        {peer}
      </li>
    )
  }
}

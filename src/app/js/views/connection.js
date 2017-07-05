import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Peer from './peer'

class Connection extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false
    }
  }

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

Connection.displayName = 'Connection'

Connection.propTypes = {
  ipfs: PropTypes.object,
  location: PropTypes.object,
  bytesRead: PropTypes.number,
  bytesWritten: PropTypes.number,
  peer: PropTypes.object,
  addr: PropTypes.object
}

export default Connection

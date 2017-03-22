import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import multiaddr from 'multiaddr'

import {pages, router, preview} from '../actions'
import Icon from '../views/icon'
import Preview from '../components/preview'
import shouldPureComponentUpdate from '../utils/pure'

function getGatewayUrl (config) {
  if (!config.Addresses) {
    return
  }

  if (!config.Addresses.Gateway) {
    return false
  }

  const addr = multiaddr(config.Addresses.Gateway)

  // We need an address of the format /ip4/127.0.0.1/tcp/8080
  const protos = addr.protoNames()
  if (protos[0] !== 'ip4' || protos[1] !== 'tcp') {
    return false
  }

  const {address, port} = addr.nodeAddress()
  return `http://${address}:${port}`
}

class FilesPreview extends Component {
  static propTypes = {
    // state
    name: PropTypes.string.isRequired,
    preview: PropTypes.shape({
      name: PropTypes.string.isRequired,
      content: PropTypes.instanceOf(Buffer),
      stats: PropTypes.object
    }),
    config: PropTypes.object.isRequired,
    // actions
    load: PropTypes.func.isRequired,
    leave: PropTypes.func.isRequired,
    read: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired
  };

  shouldComponentUpdate = shouldPureComponentUpdate

  componentWillMount () {
    this.props.load()
  }

  componentWillUnmount () {
    this.props.leave()
  }

  _onClose = (event) => {
    event.preventDefault()

    this.props.goBack()
  };

  render () {
    const {name, read} = this.props
    const content = this.props.preview ? this.props.preview.content : null
    const stats = this.props.preview ? this.props.preview.stats : {}
    const gatewayUrl = getGatewayUrl(this.props.config)

    return (
      <div className='files-preview'>
        <div className='files-preview-header'>
          <h3>{name}</h3>
          <a onClick={this._onClose} className='close'>
            <Icon glyph='close' />
          </a>
        </div>
        <div className='files-preview-area'>
          <Preview
            name={name}
            content={content}
            stats={stats}
            read={read}
            gatewayUrl={gatewayUrl} />
        </div>
      </div>
    )
  }
}

function mapStateToProps (state, ownProps) {
  return {
    name: ownProps.location.query.name,
    preview: state.preview,
    config: state.config.config
  }
}

export default connect(mapStateToProps, {
  load: pages.preview.load,
  leave: pages.preview.leave,
  read: preview.read,
  goBack: router.goBack
})(FilesPreview)

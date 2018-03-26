import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {join} from 'path'
import multiaddr from 'multiaddr'

import {pages, preview} from './../actions'
import Preview from './../components/preview'
import Breadcrumbs from './../components/files/breadcrumbs'

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
  componentWillMount () {
    this.props.load()
    this.props.stat(this.props.name)
  }

  componentWillUnmount () {
    this.props.leave()
  }

  render () {
    const {name, read, history} = this.props
    const content = this.props.preview ? this.props.preview.content : null
    const stats = this.props.preview ? this.props.preview.stats : {}
    const gatewayUrl = getGatewayUrl(this.props.config)

    return (
      <div className='files'>
        <Breadcrumbs
          root={name}
          history={history}
        />
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

FilesPreview.propTypes = {
  // state
  name: PropTypes.string.isRequired,
  preview: PropTypes.shape({
    name: PropTypes.string.isRequired,
    content: PropTypes.instanceOf(Buffer),
    stats: PropTypes.object
  }),
  config: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  // actions
  load: PropTypes.func.isRequired,
  leave: PropTypes.func.isRequired,
  stat: PropTypes.func.isRequired,
  read: PropTypes.func.isRequired
}

function mapStateToProps (state, ownProps) {
  return {
    name: join('/', ownProps.match.params[0]),
    preview: state.preview,
    config: state.config.config
  }
}

export default connect(mapStateToProps, {
  load: pages.preview.load,
  leave: pages.preview.leave,
  stat: preview.stat,
  read: preview.read
})(FilesPreview)

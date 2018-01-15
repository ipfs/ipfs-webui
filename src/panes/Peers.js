import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {
  Pane,
  Header,
  InfoBlock,
  Footer
} from 'ipfs-react-components'

export default class Peers extends Component {
  constructor (props) {
    super(props)
    props.poller.start(['peers'])
  }

  state = {
    search: null,
    location: 'Unknown',
    peers: []
  }

  setPeers = (stats) => {
    let obj = {}
    if (stats.peers) obj.peers = stats.peers
    if (stats.node) obj.location = stats.node.location

    this.setState(obj)
  }

  componentDidMount () {
    this.props.poller.on('change', this.setPeers)
    this.setPeers(this.props.poller.stats)
  }

  componentWillUnmount () {
    this.props.poller.stop(['peers'])
    this.props.poller.removeListener('change', this.setPeers)
  }

  onChangeSearch = event => {
    this.setState({ search: event.target.value.toLowerCase() })
  }

  render () {
    var peers = this.state.peers

    if (this.state.search !== null && this.state.search !== '') {
      peers = peers.filter(peer => {
        return peer.id.toLowerCase().indexOf(this.state.search) > -1 ||
          peer.location.formatted.toLowerCase().indexOf(this.state.search) > -1
      })
    }

    peers = peers.map((peer, i) => {
      return (<InfoBlock key={i} title={peer.id} info={peer.location.formatted} />)
    })

    return (
      <Pane class='peers'>
        <Header
          title={'Earth - ' + this.props.location}
          subtitle={this.state.peers.length + ' peers'} />
        <div className='main'>
          {peers}
        </div>

        <Footer>
          <div className='right'>
            <input type='text' onChange={this.onChangeSearch} placeholder='Search peer' />
          </div>
        </Footer>
      </Pane>
    )
  }
}

Peers.propTypes = {
  location: PropTypes.string,
  peers: PropTypes.array
}

Peers.defaultProps = {
  location: 'Unknown',
  peers: []
}

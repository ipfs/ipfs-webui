import React, {Component} from 'react'
import PropTypes from 'prop-types'
import StatsPoller from 'ipfs-stats'

import {Peers as PeersPane} from 'ipfs-react-components'

export default class Peers extends Component {
  static propTypes = {
    poller: PropTypes.instanceOf(StatsPoller).isRequired
  }

  constructor (props) {
    super(props)
    props.poller.start(['peers'])
  }

  state = {}

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
    return (
      <PeersPane
        location={this.state.location} 
        peers={this.state.peers} />
    )
  }
}

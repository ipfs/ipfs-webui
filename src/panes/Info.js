import React, {Component} from 'react'
import PropTypes from 'prop-types'
import prettyBytes from 'pretty-bytes'

import {
  Pane,
  Header,
  Popup,
  InfoBlock
} from 'ipfs-react-components'

import './Info.css'

function onClickCopy (text) {
  return () => {
    console.log(text)
  }
  // return () => clipboard.writeText(text)
  // TODO: copy to clipboard
}

export default class Info extends Component {
  static propTypes = {
    poller: PropTypes.object.isRequired
  }

  state = {
    node: {
      id: 'Undefined',
      location: 'Unknown',
      protocolVersion: 'Undefined',
      publicKey: 'Undefined',
      addresses: []
    },
    repo: {
      RepoSize: 0,
      NumObjects: 'NA'
    },
    bw: {
      TotalIn: 0,
      TotalOut: 0,
      RateIn: 0,
      RateOut: 0
    }
  }

  constructor (props) {
    super(props)
    props.poller.start(['node'])
  }

  setStats = (stats) => {
    let obj = {}
    if (stats.node) obj.node = stats.node
    if (stats.repo) obj.repo = stats.repo
    if (stats.bw) obj.bw = stats.bw

    this.setState(obj)
  }

  componentDidMount () {
    this.props.poller.on('change', this.setStats)
    this.setStats(this.props.poller.stats)
  }

  componentWillUnmount () {
    this.props.poller.stop(['node'])
    this.props.poller.removeListener('change', this.setStats)
  }

  render () {
    return (
      <Pane class={'node'}>
        <Popup />
        <Header title='Your Node' />

        <div className='main'>
          <div className='sharing'>
            <p>{prettyBytes(this.state.repo.RepoSize)}</p>
            <p>Sharing {this.state.repo.NumObjects} objects</p>
          </div>

          <InfoBlock
            title='Peer ID'
            info={this.state.node.id}
            onClick={onClickCopy(this.state.node.id)} />

          <InfoBlock
            title='Location'
            info={this.state.node.location} />

          <InfoBlock
            title='Bandwidth Used'
            info={prettyBytes(this.state.bw.TotalIn + this.state.bw.TotalOut)} />

          <InfoBlock
            title='Down Speed'
            info={prettyBytes(this.state.bw.RateIn) + '/s'} />

          <InfoBlock
            title='Up Speed'
            info={prettyBytes(this.state.bw.RateOut) + '/s'} />

          <InfoBlock
            title='Protocol Version'
            info={this.state.node.protocolVersion} />

          <InfoBlock
            title='Addresses'
            info={this.state.node.addresses} />

          <InfoBlock
            title='Public Key'
            info={this.state.node.publicKey}
            onClick={onClickCopy(this.state.node.publicKey)} />
        </div>
      </Pane>
    )
  }
}

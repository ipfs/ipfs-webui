import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {Info as InfoPane} from 'ipfs-react-components'

function onClickCopy (text) {
  console.log(text)
  // TODO: copy to clipboard
}

export default class Info extends Component {
  static propTypes = {
    poller: PropTypes.object.isRequired
  }

  state = {}

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
      <InfoPane
        copy={onClickCopy}
        node={this.state.node}
        repo={this.state.repo}
        bw={this.state.bw} />
    )
  }
}

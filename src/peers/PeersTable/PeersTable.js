import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import ms from 'milliseconds'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { Table, Column, AutoSizer, SortDirection } from 'react-virtualized'
import CountryFlag from 'react-country-flag'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Cid from '../../components/cid/Cid'
import { sortByProperty } from '../../lib/sort'

import './PeersTable.css'

export class PeersTable extends React.Component {
  static propTypes = {
    peerLocationsForSwarm: PropTypes.array,
    className: PropTypes.string,
    t: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      sortBy: 'latency',
      sortDirection: SortDirection.ASC
    }

    this.sort = this.sort.bind(this)
  }

  flagRenderer = (flagCode, isPrivate) => {
    // Check if the OS is Windows to render the flags as SVGs
    // Windows doesn't render the flags as emojis  ¯\_(ツ)_/¯
    const isWindows = window.navigator.appVersion.indexOf('Win') !== -1
    return (
      <span className='f4 pr2'>
        {isPrivate ? '🤝' : flagCode ? <CountryFlag code={flagCode} svg={isWindows} /> : '🌐'}
      </span>
    )
  }

  locationCellRenderer = ({ rowData }) => {
    const ref = React.createRef()
    const location = rowData.isPrivate
      ? this.props.t('localNetwork')
      : rowData.location
        ? rowData.isNearby
          ? <span>{rowData.location} <span className='charcoal-muted'>({this.props.t('nearby')})</span></span>
          : rowData.location
        : <span className='charcoal-muted fw4'>{this.props.t('app:terms.unknown')}</span>
    const value = rowData.location || this.props.t('app:terms.unknown')
    return (
      <CopyToClipboard text={value} onCopy={() => copyFeedback(ref, this.props.t)}>
        <span title={value} className='copyable' ref={ref}>
          { this.flagRenderer(rowData.flagCode, rowData.isPrivate) }
          { location }
        </span>
      </CopyToClipboard>
    )
  }

  latencyCellRenderer = ({ cellData, rowData }) => {
    const ref = React.createRef()
    const style = { width: '60px' }
    const latency = `${cellData}ms`
    if (cellData == null) return (<span className='dib o-40' style={style}>-</span>)
    return (
      <CopyToClipboard text={latency} onCopy={() => copyFeedback(ref, this.props.t)}>
        <span ref={ref} className='dib copyable'>{latency}</span>
      </CopyToClipboard>
    )
  }

  inOutCellRenderer = ({ rowData }) => {
    const ref = React.createRef()
    const { rateIn, rateOut, totalIn, totalOut } = rowData
    const details = this.props.t('currentRate') + ': ' + rateIn + ' • ' + rateOut + '; ' + this.props.t('totalTransfer') + ': ' + totalIn + ' • ' + totalOut
    return (
      <CopyToClipboard text={details} onCopy={() => copyFeedback(ref, this.props.t)}>
        <span ref={ref} className='copyable' title={details}>
          <svg width='10' height='10' className='mr1'>
            <circle cx='5' cy='5' r='5' fill='#69c4cd' />
            <path d='M0,5 a1,1 0 0,0 10,0' fill='#f39021' />
          </svg>
          {totalIn} &bull; {totalOut}
        </span>
      </CopyToClipboard>
    )
  }

  peerIdCellRenderer = ({ cellData: peerId }) => {
    const ref = React.createRef()
    return (
      <CopyToClipboard text={peerId} onCopy={() => copyFeedback(ref, this.props.t)}>
        <Cid value={peerId} identicon ref={ref} className='copyable' />
      </CopyToClipboard>
    )
  }

  connectionCellRenderer = ({ rowData }) => {
    const ref = React.createRef()
    const { address, direction } = rowData
    const title = direction != null
      ? `${address}\n(${renderDirection(direction, this.props.t)})`
      : address

    return (
      <CopyToClipboard text={address} onCopy={() => copyFeedback(ref, this.props.t)}>
      <abbr
        ref={ref}
        className='copyable'
        title={title}>
        {rowData.connection}
      </abbr>
      </CopyToClipboard>
    )
  }

  agentCellRenderer = ({ rowData }) => {
    const ref = React.createRef()
    const { agentStreams, agentVersion } = rowData
    let details = agentVersion
    if (Array.isArray(agentStreams)) {
      try { // add info about any mounted stream to the tooltip
        const protocolNames = agentStreams.map(s => s.Protocol)
        details = `${agentVersion}\n\n${protocolNames.join('\n')}`
      } catch (_) { }
    }

    return (
      <CopyToClipboard text={details} onCopy={() => copyFeedback(ref, this.props.t)}>
        <span
          ref={ref}
          className='copyable'
          title={details}>
          {agentVersion}
        </span>
      </CopyToClipboard>
    )
  }

  rowClassRenderer = ({ index }, peers = []) => {
    const { selectedPeers } = this.props
    const shouldAddHoverEffect = selectedPeers?.peerIds?.includes(peers[index]?.peerId)

    return classNames('bb b--near-white peersTableItem', index === -1 && 'bg-near-white', shouldAddHoverEffect && 'bg-light-gray')
  }

  sort ({ sortBy, sortDirection }) {
    this.setState({ sortBy, sortDirection })
  }

  render () {
    const { className, peerLocationsForSwarm, t } = this.props
    const { sortBy, sortDirection } = this.state

    const sortedList = (peerLocationsForSwarm || []).sort(sortByProperty(sortBy, sortDirection === SortDirection.ASC ? 1 : -1))
    const tableHeight = 400

    return (
      <div className={`bg-white-70 center ${className}`} style={{ height: `${tableHeight}px`, maxWidth: 1764 }}>
        { peerLocationsForSwarm && <AutoSizer disableHeight>
          {({ width }) => (
            <Table
              className='tl fw4 w-100 f6'
              headerClassName='teal fw2 ttu tracked ph2'
              rowClassName={(rowInfo) => this.rowClassRenderer(rowInfo, peerLocationsForSwarm)}
              width={width}
              height={tableHeight}
              headerHeight={32}
              rowHeight={36}
              rowCount={peerLocationsForSwarm.length}
              rowGetter={({ index }) => sortedList[index]}
              sort={this.sort}
              sortBy={sortBy}
              sortDirection={sortDirection}>
              <Column label={t('app:terms.location')} cellRenderer={this.locationCellRenderer} dataKey='location' width={450} className='f6 charcoal truncate pl2' />
              <Column label={t('app:terms.latency')} cellRenderer={this.latencyCellRenderer} dataKey='latency' width={200} className='f6 charcoal pl2' />
              <Column label={t('app:terms.in') + '/' + t('app:terms.out')} cellRenderer={this.inOutCellRenderer} dataKey='latency' width={270} className='f6 charcoal pl2' />
              <Column label={t('app:terms.peerId')} cellRenderer={this.peerIdCellRenderer} dataKey='peerId' width={250} className='charcoal monospace truncate f6 pl2' />
              <Column label={t('app:terms.connection')} cellRenderer={this.connectionCellRenderer} dataKey='connection' width={250} className='f6 charcoal truncate pl2' />
              <Column label={t('app:terms.agent')} cellRenderer={this.agentCellRenderer} dataKey='connection' width={250} className='f6 charcoal truncate pl2' />
            </Table>
          )}
        </AutoSizer> }
      </div>
    )
  }
}

// API returns integer atm, but that may change in the future
// Current mapping based on https://github.com/libp2p/go-libp2p-core/blob/21efed75194d73e21e16fe3124fb9c4127a85308/network/network.go#L38-39
const renderDirection = (direction, i18n) => {
  if (direction == null) return
  switch (direction) {
    case 1:
      return i18n('connectionDirectionInbound')
    case 2:
      return i18n('connectionDirectionOutbound')
    default:
      return direction
  }
}

// temporarily replaces contents of element with 'copied!'
const copyFeedback = (ref, t) => {
  const tag = ref.current
  const { parentNode } = tag
  const msg = document.createElement('em')
  msg.innerText = t('copyFeedback')
  parentNode.replaceChild(msg, tag)
  setTimeout(() => parentNode.replaceChild(tag, msg), ms.seconds(3))
}

export default connect(
  'selectPeerLocationsForSwarm',
  'selectSelectedPeers',
  withTranslation('peers')(PeersTable)
)

import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { Table, Column, AutoSizer, SortDirection } from 'react-virtualized'
import CountryFlag from 'react-country-flag'
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
    const location = rowData.isPrivate
      ? this.props.t('localNetwork')
      : rowData.location
        ? rowData.isNearby
          ? <span>{rowData.location} <span className='charcoal-muted'>({this.props.t('nearby')})</span></span>
          : rowData.location
        : <span className='charcoal-muted fw4'>{this.props.t('app:terms.unknown')}</span>

    return (
      <span title={ rowData.location || this.props.t('app:terms.unknown')}>
        { this.flagRenderer(rowData.flagCode, rowData.isPrivate) }
        { location }
      </span>
    )
  }

  latencyCellRenderer = ({ cellData }) => {
    const style = { width: '60px' }

    return cellData
      ? <span className='dib tr' style={style}>{cellData}ms</span>
      : <span className='dib tr o-40' style={style}>-</span>
  }

  peerIdCellRenderer = ({ cellData }) => (
    <Cid value={cellData} identicon />
  )

  connectionCellRenderer = ({ rowData }) => (
    <abbr style={{ textDecoration: 'none' }} title={rowData.address}>
      {rowData.connection}
    </abbr>
  )

  agentCellRenderer = ({ rowData }) => (
    <abbr style={{ textDecoration: 'none' }} title={rowData.agent}>
      {rowData.agent}
    </abbr>
  )

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
              <Column label={t('app:terms.latency')} cellRenderer={this.latencyCellRenderer} dataKey='latency' width={250} className='f6 charcoal pl2' />
              <Column label={t('app:terms.in') + '/' + t('app:terms.out')} cellRenderer={this.latencyCellRenderer} dataKey='latency' width={250} className='f6 charcoal pl2' />
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

export default connect(
  'selectPeerLocationsForSwarm',
  'selectSelectedPeers',
  withTranslation('peers')(PeersTable)
)

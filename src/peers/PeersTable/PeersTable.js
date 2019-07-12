import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { translate, Trans } from 'react-i18next'
import { Table, Column, AutoSizer, SortDirection } from 'react-virtualized'
import CountryFlag from 'react-country-flag'
import Cid from '../../components/cid/Cid'
import { sortByProperty } from '../../lib/sort';

export class PeersTable extends React.Component {
  static propTypes = {
    peerLocationsForSwarm: PropTypes.array,
    t: PropTypes.func.isRequired
  }

  constructor (props) {
    super (props)

    this.state =  {
      sortBy: 'latency',
      sortDirection: SortDirection.ASC
    }

    this.sort = this.sort.bind(this)
  }

  flagRenderer = (flagCode) => {
    // Check if the OS is Windows to render the flags as SVGs
    // Windows doesn't render the flags as emojis  ¯\_(ツ)_/¯
    const isWindows = window.navigator.appVersion.indexOf('Win') !== -1
    return (
      <span className='f4 pr2'>
        {flagCode ? <CountryFlag code={flagCode} svg={isWindows} /> : '🌐'}
      </span>
    )
  }

  locationCellRenderer = ({ rowData }) => (
    <span>
      { this.flagRenderer(rowData.flagCode) }
      { rowData.location ? rowData.location : (
        <span className='charcoal-muted fw4'>{this.props.t('unknownLocation')}</span>
      ) }
    </span>
  )

  latencyCellRenderer = ({ cellData }) => {
    const style = { width: '60px' }

    return cellData
      ? <span class='dib tr' style={style}>{cellData}</span>
      : <span className='dib tr o-40' style={style}>-</span>
  }

  peerIdCellRenderer = ({ cellData }) => (
    <Cid value={cellData} />
  )

  notesCellRenderer = ({ cellData }) => {
    if (!cellData) return

    if (cellData.type === 'BOOTSTRAP_NODE') {
      return this.props.t('bootstrapNode')
    } else if (cellData.type === 'RELAY_NODE') {
      return <Trans
        i18nKey='viaRelay'
        defaults='via <0>{node}</0>'
        values={{ node: cellData.node }}
        components={[<Cid value={cellData.node} />]} />
    }
  }

  rowClassRenderer = ({ index }) => {
    return index === -1 ? 'bb b--near-white bg-near-white' : 'bb b--near-white'
  }

  sort ({ sortBy, sortDirection }) {
    this.setState({ sortBy, sortDirection })
  }

  render () {
    const { peerLocationsForSwarm, t } = this.props
    const { sortBy, sortDirection } = this.state

    const sortedList = peerLocationsForSwarm.sort(sortByProperty(sortBy === 'latency' ? 'rawLatency' : sortBy, sortDirection === SortDirection.ASC ? 1 : -1))
    const tableHeight = 400

    return (
      <div className='bg-white-70 center' style={{ 'height': `${tableHeight}px`, maxWidth: 1764 }}>
        { peerLocationsForSwarm && <AutoSizer disableHeight>
          {({ width }) => (
            <Table
              className='tl fw4 w-100 f6'
              headerClassName='aqua fw2 ttu tracked ph2'
              rowClassName={this.rowClassRenderer}
              width={width}
              height={tableHeight}
              headerHeight={32}
              rowHeight={36}
              rowCount={peerLocationsForSwarm.length}
              rowGetter={({ index }) => sortedList[index]}
              sort={this.sort}
              sortBy={sortBy}
              sortDirection={sortDirection}>
              <Column label={t('location')} cellRenderer={this.locationCellRenderer} dataKey='locationCode' width={450} className='f6 navy-muted truncate pl2' />
              <Column label={t('latency')} cellRenderer={this.latencyCellRenderer} dataKey='latency' width={250} className='f6 navy-muted monospace pl2' />
              <Column label={t('peerId')} cellRenderer={this.peerIdCellRenderer} dataKey='peerId' width={250} className='charcoal monospace truncate f7 pl2' />
              <Column label={t('connection')} dataKey='connection' width={400} className='f6 navy-muted truncate pl2' />
              <Column label={t('notes')} cellRenderer={this.notesCellRenderer} dataKey='notes' width={400} className='charcoal monospace truncate f7 pl2' />
            </Table>
          )}
        </AutoSizer> }
      </div>
    )
  }
}

export default connect(
  'selectPeerLocationsForSwarm',
  translate('peers')(PeersTable)
)

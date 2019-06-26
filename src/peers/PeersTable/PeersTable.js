import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import { Table, Column, AutoSizer } from 'react-virtualized'
import CountryFlag from 'react-country-flag'

export class PeersTable extends React.Component {
  static propTypes = {
    peerLocationsForSwarm: PropTypes.array,
    t: PropTypes.func.isRequired
  }

  flagRenderer = (locationCode) => {
    // Check if the OS is Windows to render the flags as SVGs
    // Windows doesn't render the flags as emojis  ¯\_(ツ)_/¯
    const isWindows = window.navigator.appVersion.indexOf('Win') !== -1
    return (
      <span className='f4 pr2'>
        {locationCode ? <CountryFlag code={locationCode} svg={isWindows} /> : '🌐'}
      </span>
    )
  }

  locationCellRenderer = ({ rowData }) => (
    <span>
      { this.flagRenderer(rowData.locationCode) }
      { rowData.locationCode ? rowData.locationCode : (
        <span className='charcoal-muted fw4'>{this.props.t('unknownLocation')}</span>
      ) }
    </span>
  )

  rowClassRenderer = ({ index }) => {
    return index === -1 ? 'bb b--near-white bg-near-white' : 'bb b--near-white'
  }

  render () {
    const { peerLocationsForSwarm, t } = this.props
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
              rowGetter={({ index }) => peerLocationsForSwarm[index]}>
              <Column label={t('peerId')} dataKey='peerId' width={500} className='charcoal monospace truncate f7 pl2' />
              <Column label={t('location')} cellRenderer={this.locationCellRenderer} dataKey='locationCode' width={350} className='f6 navy-muted truncate pl2' />
              <Column label={t('connection')} dataKey='connection' width={400} className='f6 navy-muted truncate pl2' />
              <Column label={t('latency')} dataKey='latency' width={250} className='f6 navy-muted truncate pl2' />
              <Column label={t('notes')} dataKey='notes' width={400} className='charcoal monospace truncate f7 pl2' />
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

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import { Table, Column, AutoSizer } from 'react-virtualized'
import CountryFlag from 'react-country-flag'
import Address from '../../components/address/Address'

export class PeersTable extends React.Component {
  static propTypes = {
    peerLocationsForSwarm: PropTypes.array,
    className: PropTypes.string,
    t: PropTypes.func.isRequired
  }

  flagRenderer = (flagCode) => {
    // Check if the OS is Windows to render the flags as SVGs
    // Windows doesn't render the flags as emojis  ¯\_(ツ)_/¯
    const isWindows = window.navigator.appVersion.indexOf('Win') !== -1
    return (
      <span className='pr2 f4'>
        {flagCode ? <CountryFlag code={flagCode} svg={isWindows} /> : '🏳️‍🌈'}
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

  addressCellRenderer = ({ cellData }) => (
    <Address value={cellData} />
  )

  rowClassRenderer = ({ index }) => {
    return index === -1 ? 'bb b--near-white bg-near-white' : 'bb b--near-white'
  }

  render () {
    const { className, peerLocationsForSwarm, t } = this.props
    const tableHeight = 400

    return (
      <div className={`bg-white-70 center ${className}`} style={{ 'height': `${tableHeight}px`, maxWidth: 1764 }}>
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
              <Column label={t('peerId')} dataKey='peerId' width={380} className='charcoal monospace truncate f7 pl2' />
              <Column label={t('address')} cellRenderer={this.addressCellRenderer} dataKey='address' width={300} flexGrow={1} className='f6 pl2' />
              <Column label={t('location')} cellRenderer={this.locationCellRenderer} dataKey='location' width={380} flexGrow={1} className='f5 navy-muted fw5 truncate pl2' />
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

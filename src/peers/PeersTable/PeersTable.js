import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Table, Column, AutoSizer } from 'react-virtualized'
import CountryFlag from 'react-country-flag'
import Address from '../../components/address/Address'

export class PeersTable extends React.Component {
  static propTypes = {
    peers: PropTypes.array,
    t: PropTypes.func.isRequired
  }

  flagRenderer = (flagCode) => {
    // Check if the OS is Windows to render the flags as SVGs
    // Windows doesn't render the flags as emojis  ¯\_(ツ)_/¯
    const isWindows = window.navigator.appVersion.indexOf('Win') !== -1
    return (
      <span className='pr2'>
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
    const { peers, t } = this.props
    const tableHeight = 320

    return (
      <div className='flex w-100 bg-white-70' style={{ 'height': `${tableHeight}px` }}>
        { peers && <AutoSizer>
          {({ width }) => (
            <Table
              className='tl fw4 w-100 f7'
              headerClassName='aqua fw2 ttu tracked ph2'
              rowClassName={this.rowClassRenderer}
              width={width}
              height={tableHeight}
              headerHeight={32}
              rowHeight={32}
              rowCount={peers.length}
              rowGetter={({ index }) => peers[index]}>
              <Column label={t('peerId')} dataKey='id' width={430} className='charcoal monospace pl2 truncate f7' />
              <Column label={t('address')} cellRenderer={this.addressCellRenderer} dataKey='address' width={280} className='pl2' />
              <Column label={t('location')} cellRenderer={this.locationCellRenderer} dataKey='location' width={220} className='pl2 f6 navy-muted b truncate' />
            </Table>
          )}
        </AutoSizer> }
      </div>
    )
  }
}

export default translate('peers')(PeersTable)

import React from 'react'
import PropTypes from 'prop-types'
import { Table, Column, AutoSizer } from 'react-virtualized'
import CountryFlag from 'react-country-flag'

export class PeersTable extends React.Component {
  static propTypes = {
    peers: PropTypes.array
  }

  flagRenderer = (flagCode) => {
    // Check if the OS is Windows to render the flags as SVGs
    // Windows doesn't render the flags as emojis  ¯\_(ツ)_/¯
    const isWindows = window.navigator.appVersion.indexOf('Win') !== -1

    if (isWindows) {
      return (
        <span className='pr2'>
          <CountryFlag code={flagCode} svg />
        </span>
      )
    }

    return <CountryFlag code={flagCode} />
  }

  locationCellRenderer = ({ rowData }) => (
    <span>
      { rowData.flagCode ? this.flagRenderer(rowData.flagCode) : '🏳️‍🌈' }
      { rowData.location }
    </span>
  )

  render () {
    const { peers } = this.props
    const tableHeight = 220

    return (
      <div className='flex w-100' style={{ 'height': `${tableHeight}px` }}>
        { peers && <AutoSizer>
          {({width}) => (
            <Table
              className='tl fw4 w-100'
              headerClassName='teal o-60 fw2 tracked'
              rowClassName='flex items-center bb b--near-white f6'
              width={width}
              height={tableHeight}
              headerHeight={32}
              rowHeight={32}
              rowCount={peers.length}
              rowGetter={({ index }) => peers[index]}>
              <Column label='ID' dataKey='id' width={430} className='dark-gray monospace pr3 truncate' />
              <Column label='Network address' dataKey='address' width={280} className='silver monospace pr3 truncate' />
              <Column label='Location' cellRenderer={this.locationCellRenderer} dataKey='location' width={220} className='navy-muted b truncate' />
            </Table>
          )}
        </AutoSizer> }
      </div>
    )
  }
}

export default PeersTable

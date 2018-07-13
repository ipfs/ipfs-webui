import React from 'react'
import PropTypes from 'prop-types'
import { Table, Column, AutoSizer } from 'react-virtualized'
import './PeersTable.css'

export class PeersTable extends React.Component {
  static propTypes = {
    peers: PropTypes.array
  }

  render () {
    const { peers } = this.props

    return (
      <div className='PeersTableContainer flex w-100'>
        { peers && <AutoSizer>
          {({width}) => (
            <Table
              className='PeersTable tl fw4 w-100'
              headerClassName='teal o-60 fw2 tracked'
              rowClassName='flex items-center bb b--near-white f6'
              width={width}
              height={220}
              headerHeight={32}
              rowHeight={32}
              rowCount={peers.length}
              rowGetter={({ index }) => peers[index]}>
              <Column label='ID' dataKey='id' width={430} className='dark-gray monospace' />
              <Column label='Network address' dataKey='address' width={280} className='silver monospace' />
              <Column label='Location' dataKey='location' width={220} className='navy-muted b' />
            </Table>
          )}
        </AutoSizer> }
      </div>
    )
  }
}

export default PeersTable

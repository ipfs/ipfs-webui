import React from 'react'
import { Table, Column, AutoSizer } from 'react-virtualized'

class LinksTable extends React.Component {
  onRowClick = ({rowData}) => {
    const {onLinkClick} = this.props
    onLinkClick(rowData)
  }

  render () {
    const {links} = this.props
    const headerClassName = 'mid-gray fw2 tracked teal'
    return (
      <AutoSizer>
        {({width}) => (
          <Table
            className='tl fw4'
            rowClassName='pointer bb b--near-white f7'
            width={width}
            height={370}
            headerHeight={32}
            rowHeight={29}
            rowCount={links.length}
            rowGetter={({ index }) => ({index, ...links[index]})}
            onRowClick={this.onRowClick}>
            <Column dataKey='index' width={30} className='pv2 silver monospace tr pr2' />
            <Column label='Path' dataKey='path' width={210} flexGrow={1} className='pv2 dark-gray navy-muted f6' headerClassName={headerClassName} />
            <Column label='CID' dataKey='target' width={350} className='pv2 mid-gray monospace' headerClassName={headerClassName} />
          </Table>
        )}
      </AutoSizer>
    )
  }
}

export default LinksTable

import React from 'react'
import { Table, Column, AutoSizer } from 'react-virtualized'
import './LinksTable.css'

class LinksTable extends React.Component {
  handleOnRowClick = ({ rowData }) => {
    const { onLinkClick } = this.props
    onLinkClick(rowData)
  }

  render () {
    const { links } = this.props
    const headerClassName = 'mid-gray f6 fw2 silver'
    const cidRowStyle = {
      overflow: 'hidden'
    }
    const rowHeight = 29
    const headerHeight = 32
    const tableHeight = Math.min(400, links.length * rowHeight + headerHeight)
    return (
      <div>
        <AutoSizer disableHeight>
          {({ width }) => (
            <Table
              className='tl fw4 LinksTable'
              rowClassName='pointer bb b--transparent f7'
              width={width}
              height={tableHeight}
              headerHeight={20}
              rowHeight={rowHeight}
              rowCount={links.length}
              rowGetter={({ index }) => ({ index, ...links[index] })}
              onRowClick={this.handleOnRowClick}
            >
              <Column label='' dataKey='index' width={34} className='pv2 silver spacegrotesk white tr pr1' />
              <Column label='Path' dataKey='path' width={210} flexGrow={1} className='pv2 white spacegrotesk f6-ns' headerClassName={headerClassName} />
              <Column label='CID' dataKey='target' width={360} className='pv2 w95fa spacegrotesk purple no-ellipsis' headerClassName={headerClassName} style={cidRowStyle} />
            </Table>
          )}
        </AutoSizer>
      </div>
    )
  }
}

export default LinksTable

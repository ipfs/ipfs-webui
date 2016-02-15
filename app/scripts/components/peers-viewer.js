import React, {Component, PropTypes} from 'react'
import {FlexTable, FlexColumn, AutoSizer} from 'react-virtualized'
import {isEqual} from 'lodash'
import {OverlayTrigger, Tooltip} from 'react-bootstrap'
import CopyToClipboard from 'react-copy-to-clipboard'

import Identicon from './identicon'

const idCellRenderer = (id, cellDataKey, rowData, rowIndex, columnData) => {
  const tp = <Tooltip id={id}>{id}</Tooltip>
  return (
    <OverlayTrigger placement='top' overlay={tp}>
      <CopyToClipboard text={id}>
        <div className='id-entry-wrapper'>
          <Identicon id={id.substring(2)} />
          {id.substring(2, 10)}
        </div>
      </CopyToClipboard>
    </OverlayTrigger>
  )
}

export default class PeersViewer extends Component {
  static propTypes = {
    ids: PropTypes.array.isRequired,
    details: PropTypes.object
  };

  _noRowsRenderer = () => {
    return (
      <div className='peers-empty'>
        Sorry, you are not connected to any peers
      </div>
    )
  };

  _getDatum = (list, index) => {
    return list[index]
  };

  _createTable = (list) => {
    return ({width, height}) => {
      const rowsCount = list.length
      const rowGetter = (index) => this._getDatum(list, index)

      return (
        <FlexTable
          ref='table'
          className='peers-viewer'
          headerHeight={40}
          headerClassName='peers-viewer-header'
          width={width}
          height={height}
          noRowsRenderer={this._noRowsRenderer}
          rowsCount={rowsCount}
          rowHeight={40}
          rowGetter={rowGetter}
          rowClassName='peer-entry'
        >
          <FlexColumn
            label='ID'
            cellClassName='id-entry'
            cellRenderer={idCellRenderer}
            dataKey='id'
            width={150}
          />
          <FlexColumn
            label='Network Address'
            cellClassName='address-entry'
            dataKey='address'
            width={250}
          />
          <FlexColumn
            label='Location'
            cellClassName='location-entry'
            dataKey='location'
            width={250}
          />
          <FlexColumn
            label='Agent'
            cellClassName='agent-entry'
            dataKey='AgentVersion'
            width={250}
          />
        </FlexTable>
      )
    }
  };

  shouldComponentUpdate (nextProps) {
    return !isEqual(nextProps, this.props)
  }

  render () {
    const list = this.props.ids.map((peer) => {
      const details = this.props.details[peer.id]
      // const color = colorHash(peer.id)
      if (details) {
        return details
      }

      return peer
    })

    return (
      <div className='AutoSizerWrapper'>
        <AutoSizer>
          {this._createTable(list)}
        </AutoSizer>
      </div>
    )
  }
}

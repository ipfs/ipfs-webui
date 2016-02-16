import React, {Component, PropTypes} from 'react'
import {FlexTable, FlexColumn, AutoSizer} from 'react-virtualized'
import {isEqual} from 'lodash'
import {OverlayTrigger, Tooltip} from 'react-bootstrap'
import CopyToClipboard from 'react-copy-to-clipboard'

import Identicon from './identicon'
import Flag from './flag'

const locationDataGetter = (dataKey, rowData) => {
  return rowData.location
}

const locationCellRenderer = (location, cellDataKey, rowData, rowIndex, columnData) => {
  if (!location) return '-'

  return (
    <div>
      <Flag country={location.countryCode} />
      {location.city}, {location.country}
    </div>
  )
}

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

const agentCellRenderer = (agent, cellDataKey, rowData, rowIndex, columnData) => {
  if (!agent) return '-'

  const [base, version] = agent.split('/')

  return (
    <span>
      <strong>{base}</strong>
      /{version}
    </span>
  )
}

export default class PeersViewer extends Component {
  static propTypes = {
    ids: PropTypes.array.isRequired,
    details: PropTypes.object,
    locations: PropTypes.object
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
          className='peers-viewer-table'
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
            cellDataGetter={locationDataGetter}
            cellRenderer={locationCellRenderer}
            cellClassName='location-entry'
            dataKey='location'
            width={250}
          />
          <FlexColumn
            label='Agent'
            cellClassName='agent-entry'
            cellRenderer={agentCellRenderer}
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
      const location = this.props.locations[peer.id]

      let res = peer
      if (details) res = details
      res.location = location

      return res
    })

    return (
      <div className='peers-viewer'>
        <AutoSizer>
          {this._createTable(list)}
        </AutoSizer>
      </div>
    )
  }
}

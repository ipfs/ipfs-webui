import React, {Component, PropTypes} from 'react'
import {FlexTable, FlexColumn, AutoSizer} from 'react-virtualized'
import {isEqual} from 'lodash-es'
import {OverlayTrigger, Tooltip} from 'react-bootstrap'
import CopyToClipboard from 'react-copy-to-clipboard'

import Identicon from './identicon'
import Flag from './flag'

export default class PeersViewer extends Component {
  static propTypes = {
    ids: PropTypes.array.isRequired,
    details: PropTypes.object,
    locations: PropTypes.object
  };

  _locationDataGetter = (dataKey, rowData) => {
    return rowData.location
  };

  _addressDataGetter = (dataKey, rowData) => {
    return rowData.addr && rowData.addr.toString()
  }

  _idCellRenderer = (id) => {
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
  };

  _locationCellRenderer = (location) => {
    if (!location || !location.country_code) return '-'
    let text = ''

    const {city, country_name: country, country_code: code} = location
    if (city) text += city
    if (city && country) text += ', '
    if (country) text += country

    return (
      <div>
        <Flag country={code} />
        {text}
      </div>
    )
  };

  _agentCellRenderer = (agent) => {
    if (!agent) return '-'

    const [base, version] = agent.split('/')

    return (
      <span>
        <strong>{base}</strong>
        /{version}
      </span>
    )
  };

  _noRowsRenderer = () => {
    return (
      <div className='peers-empty'>
        Sorry, you are not connected to any peers
      </div>
    )
  };

  _createTable = (list) => {
    return ({width, height}) => {
      const rowsCount = list.length
      const rowGetter = (index) => {
        return list[index]
      }

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
            cellRenderer={this._idCellRenderer}
            dataKey='id'
            width={150}
          />
          <FlexColumn
            label='Network Address'
            cellClassName='address-entry'
            cellDataGetter={this._addressDataGetter}
            dataKey='addr'
            width={250}
          />
          <FlexColumn
            label='Location'
            cellDataGetter={this._locationDataGetter}
            cellRenderer={this._locationCellRenderer}
            cellClassName='location-entry'
            dataKey='location'
            width={250}
          />
          <FlexColumn
            label='Agent'
            cellClassName='agent-entry'
            cellRenderer={this._agentCellRenderer}
            dataKey='agentVersion'
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
      const details = this.props.details[peer]
      const location = this.props.locations[peer]

      return {
        id: peer,
        ...details,
        location: location
      }
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

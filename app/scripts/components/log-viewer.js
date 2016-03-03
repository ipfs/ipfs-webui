import React, {Component, PropTypes} from 'react'
import {FlexTable, FlexColumn, AutoSizer} from 'react-virtualized'
import {isEqual, startsWith, isPlainObject, reduce} from 'lodash-es'
import JSONPretty from 'react-json-pretty'

const pad = (val) => {
  let res = val.toString()
  return res.length === 1 ? `0${res}` : res
}

const timestamp = (time) => {
  const d = new Date(time)
  const year = d.getFullYear()
  const month = pad(d.getMonth())
  const day = pad(d.getDay())
  const hour = pad(d.getHours())
  const minute = pad(d.getMinutes())
  const second = pad(d.getSeconds())

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const timestampCellGetter = (_, {time}, __) => timestamp(time)

const eventCellGetter = (dataKey, {event, system}, columnData) => {
  return {event, system}
}

const eventCellRenderer = (data, cellDataKey, rowData, rowIndex, columnData) => {
  const {event, system} = data
  return (
    <span>
      <strong>{system}</strong> [{event}]
    </span>
  )
}

const detailsCellGetter = (dataKey, rowData, columnData) => {
  const {time, system, event, ...details} = rowData
  return details
}

const detailsCellRenderer = (cellData, cellDataKey, rowData, rowIndex, columnData) => {
  return <JSONPretty json={cellData} />
}

export default class LogViewer extends Component {
  static propTypes = {
    list: PropTypes.array,
    tail: PropTypes.bool,
    selectedSystem: PropTypes.string
  };

  static defaultProps = {
    list: [],
    systems: [],
    selectedSystem: '',
    tail: false
  };

  _noRowsRenderer = () => {
    return (
      <div className='logs-view-empty'>
        No log data to be shown
      </div>
    )
  };

  _getDatum = (list, index) => {
    return list[index]
  };

  _getRowHeight = (list, index) => {
    const {time, system, event, ...details} = this._getDatum(list, index)
    const count = reduce(details, (sum, value, key) => {
      if (isPlainObject(value)) {
        return sum + Object.keys(value).length
      }

      return sum + 1
    }, 0)

    return count * 25 + 70
  };

  _createTable = (list) => {
    const rowsCount = list.length
    const scrollToIndex = this.props.tail ? list.length - 1 : undefined
    const rowGetter = (index) => this._getDatum(list, index)
    const getRowHeight = (index) => this._getRowHeight(list, index)

    return ({width, height}) => (
      <FlexTable
        ref='table'
        className='log-viewer'
        headerHeight={40}
        width={width}
        height={height}
        noRowsRenderer={this._noRowsRenderer}
        rowsCount={rowsCount}
        rowHeight={getRowHeight}
        rowGetter={rowGetter}
        rowClassName='log-entry'
        scrollToIndex={scrollToIndex}
      >
        <FlexColumn
          label='Timestamp'
          cellDataGetter={timestampCellGetter}
          cellClassName='log-entry-time'
          dataKey='time'
          width={150}
        />
        <FlexColumn
          label='System [Event]'
          cellClassName='log-entry-event'
          cellDataGetter={eventCellGetter}
          cellRenderer={eventCellRenderer}
          dataKey='event'
          width={300}
        />
        <FlexColumn
          label='Details'
          cellClassName='log-entry-details'
          cellDataGetter={detailsCellGetter}
          cellRenderer={detailsCellRenderer}
          dataKey='system'
        />
      </FlexTable>
    )
  };

  shouldComponentUpdate (nextProps) {
    return !isEqual(nextProps, this.props)
  }

  render () {
    const list = this.props.list.filter((elem) => startsWith(elem.system, this.props.selectedSystem))

    return (
      <div className='AutoSizerWrapper'>
        <AutoSizer>
          {this._createTable(list)}
        </AutoSizer>
      </div>
    )
  }
}

import React, {Component, PropTypes} from 'react'
import {FlexTable, FlexColumn} from 'react-virtualized'
import {map, isEqual, startsWith} from 'lodash'

const DetailsList = ({data}) => {
  const entries = map(data, (value, key) => (
    <div key={key}>
      <strong>{key}:</strong> {JSON.stringify(value)}
    </div>
  ))
  return (
    <div className='details-view'>
      {entries}
    </div>
  )
}

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

const eventCellGetter = (dataKey, {event, system}, columnData) => {
  return {event, system}
}

const eventCellRenderer = ({event, system}, cellDataKey, rowData, rowIndex, columnData) => {
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
  return <DetailsList data={cellData} />
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
    return list[index % list.length]
  };

  shouldComponentUpdate (nextProps) {
    return !isEqual(nextProps, this.props)
  }

  render () {
    const list = this.props.list.filter((elem) => startsWith(elem.system, this.props.selectedSystem))
    const rowsCount = list.length
    const scrollToIndex = this.props.tail ? list.length - 1 : undefined
    const rowGetter = (index) => this._getDatum(list, index)

    return (
      <FlexTable
        ref='table'
        className='log-viewer'
        headerHeight={40}
        height={500}
        noRowsRenderer={this._noRowsRenderer}
        rowsCount={rowsCount}
        rowHeight={60}
        rowGetter={rowGetter}
        rowClassName='log-entry'
        scrollToIndex={scrollToIndex}
      >
        <FlexColumn
          label='Timestamp'
          cellDataGetter={(_, {time}, __) => timestamp(time)}
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
  }
}

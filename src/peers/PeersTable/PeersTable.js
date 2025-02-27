import React, { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import ms from 'milliseconds'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { Table, Column, AutoSizer, SortDirection } from 'react-virtualized'
import CountryFlag from 'react-country-flag'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Cid from '../../components/cid/Cid.js'
import { sortByProperty } from '../../lib/sort.js'

import './PeersTable.css'

const flagRenderer = (flagCode, isPrivate) => {
  // Check if the OS is Windows to render the flags as SVGs
  // Windows doesn't render the flags as emojis  ¯\_(ツ)_/¯
  const isWindows = window.navigator.appVersion.indexOf('Win') !== -1
  return (
      <span className='f4 pr2'>
        {isPrivate ? '🤝' : flagCode ? <CountryFlag code={flagCode} svg={isWindows} /> : '🌐'}
      </span>
  )
}

const locationCellRenderer = (t) => ({ rowData }) => {
  const ref = React.createRef()
  const location = rowData.isPrivate
    ? t('localNetwork')
    : rowData.location
      ? rowData.isNearby
        ? <span>{rowData.location} <span className='charcoal-muted'>({t('nearby')})</span></span>
        : rowData.location
      : <span className='charcoal-muted fw4'>{t('app:terms.unknown')}</span>
  const value = rowData.location || t('app:terms.unknown')
  return (
      <CopyToClipboard text={value} onCopy={() => copyFeedback(ref, t)}>
        <span title={value} className='copyable' ref={ref}>
          { flagRenderer(rowData.flagCode, rowData.isPrivate) }
          { location }
        </span>
      </CopyToClipboard>
  )
}

const latencyCellRenderer = ({ cellData }) => {
  const style = { width: '60px' }
  const latency = `${cellData}ms`
  if (cellData == null) return (<span className='dib o-40 no-select' style={style}>-</span>)
  return (<span className='dib no-select'>{latency}</span>)
}

const peerIdCellRenderer = (t) => ({ cellData: peerId }) => {
  const ref = React.createRef()
  const p2pMultiaddr = `/p2p/${peerId}`
  return (
      <CopyToClipboard text={p2pMultiaddr} onCopy={() => copyFeedback(ref, t)}>
        <Cid value={peerId} identicon ref={ref} className='copyable' />
      </CopyToClipboard>
  )
}

const protocolsCellRenderer = (t) => ({ rowData }) => {
  const ref = React.createRef()
  const { protocols } = rowData
  const title = protocols.split(', ').join('\n')
  return (
      <CopyToClipboard text={protocols} onCopy={() => copyFeedback(ref, t)}>
        <span
          ref={ref}
          className='copyable'
          title={title}>
          { protocols.replaceAll('[unnamed]', '🤔') }
        </span>
      </CopyToClipboard>
  )
}

const connectionCellRenderer = (t) => ({ rowData }) => {
  const ref = React.createRef()
  const { address, direction, peerId } = rowData
  const p2pMultiaddr = `${address}/p2p/${peerId}`
  const title = direction != null
    ? `${address}\n(${renderDirection(direction, t)})`
    : address

  return (
      <CopyToClipboard text={p2pMultiaddr} onCopy={() => copyFeedback(ref, t)}>
        <abbr
          ref={ref}
          className='copyable'
          title={title}>
          {rowData.connection}
        </abbr>
      </CopyToClipboard>
  )
}

const rowClassRenderer = ({ index }, peers = [], selectedPeers) => {
  const shouldAddHoverEffect = selectedPeers?.peerIds?.includes(peers[index]?.peerId)

  return classNames('bb b--near-white peersTableItem', index === -1 && 'bg-near-white', shouldAddHoverEffect && 'bg-light-gray')
}

const FilterInput = ({ setFilter, t, filteredCount }) => {
  return (
    <div className='flex items-center justify-between pa2'>
      <input
        className='input-reset ba b--black-20 pa2 mb2 db w-100'
        type='text'
        placeholder='Filter peers'
        onChange={(e) => setFilter(e.target.value)}
      />
      {/* Now to display the total number of peers filtered out on the right side of the inside of the input */}
      <div className='f4 charcoal-muted absolute top-1 right-1'>{filteredCount}</div>
    </div>
  )
}

export const PeersTable = ({ className, t, peerLocationsForSwarm, selectedPeers }) => {
  const tableHeight = 400
  const [awaitedPeerLocationsForSwarm, setAwaitedPeerLocationsForSwarm] = useState([])
  const [sortBy, setSortBy] = useState('latency')
  const [sortDirection, setSortDirection] = useState(SortDirection.ASC)
  const [filter, setFilter] = useState('')

  const sort = useCallback(({ sortBy, sortDirection }) => {
    setSortBy(sortBy)
    setSortDirection(sortDirection)
  }, [])
  const filterCb = useCallback((value) => {
    setFilter(value)
  }, [])

  useEffect(() => {
    peerLocationsForSwarm?.then?.((peerLocationsForSwarm) => {
      setAwaitedPeerLocationsForSwarm(peerLocationsForSwarm)
    })
  }, [peerLocationsForSwarm])

  const filteredPeerList = useMemo(() => {
    const filterLower = filter.toLowerCase()
    if (filterLower === '') return awaitedPeerLocationsForSwarm
    return awaitedPeerLocationsForSwarm.filter(({ location, latency, peerId, connection, protocols }) => {
      if (location != null && location.toLowerCase().includes(filterLower)) {
        return true
      }
      if (latency != null && [latency, `${latency}ms`].some((str) => str.toString().includes(filterLower))) {
        return true
      }
      if (peerId != null && peerId.toString().includes(filter)) {
        return true
      }
      console.log('connection: ', connection)
      if (connection != null && connection.toLowerCase().includes(filterLower)) {
        return true
      }
      if (protocols != null && protocols.toLowerCase().includes(filterLower)) {
        return true
      }

      return false
    })
  }, [awaitedPeerLocationsForSwarm, filter])

  const sortedList = useMemo(
    () => filteredPeerList.sort(sortByProperty(sortBy, sortDirection === SortDirection.ASC ? 1 : -1)),
    [filteredPeerList, sortBy, sortDirection]
  )

  return (
    <div className={`bg-white-70 center ${className}`} style={{ height: `${tableHeight}px`, maxWidth: 1764 }}>
        <FilterInput setFilter={filterCb} t={t} filteredCount={sortedList.length} />
        { awaitedPeerLocationsForSwarm && <AutoSizer disableHeight>
          {({ width }) => (
            <>
              <Table
                className='tl fw4 w-100 f6'
                headerClassName='teal fw2 ttu tracked ph2 no-select'
                rowClassName={(rowInfo) => rowClassRenderer(rowInfo, awaitedPeerLocationsForSwarm, selectedPeers)}
                width={width}
                height={tableHeight}
                headerHeight={32}
                rowHeight={36}
                rowCount={sortedList.length}
                rowGetter={({ index }) => sortedList[index]}
                sort={sort}
                sortBy={sortBy}
                sortDirection={sortDirection}>
                <Column label={t('app:terms.location')} cellRenderer={locationCellRenderer(t)} dataKey='location' width={450} className='f6 charcoal truncate pl2' />
                <Column label={t('app:terms.latency')} cellRenderer={latencyCellRenderer} dataKey='latency' width={200} className='f6 charcoal pl2' />
                <Column label={t('app:terms.peerId')} cellRenderer={peerIdCellRenderer(t)} dataKey='peerId' width={250} className='charcoal monospace truncate f6 pl2' />
                <Column label={t('app:terms.connection')} cellRenderer={connectionCellRenderer(t)} dataKey='connection' width={250} className='f6 charcoal truncate pl2' />
                <Column label={t('protocols')} cellRenderer={protocolsCellRenderer(t)} dataKey='protocols' width={520} className='charcoal monospace truncate f7 pl2' />
              </Table>
            </>
          )}
        </AutoSizer> }
      </div>
  )
}

// API returns integer atm, but that may change in the future
// Current mapping based on https://github.com/libp2p/go-libp2p-core/blob/21efed75194d73e21e16fe3124fb9c4127a85308/network/network.go#L38-39
const renderDirection = (direction, i18n) => {
  if (direction == null) return
  switch (direction) {
    case 1:
      return i18n('connectionDirectionInbound')
    case 2:
      return i18n('connectionDirectionOutbound')
    default:
      return direction
  }
}

// temporarily replaces contents of element with 'copied!'
const copyFeedback = (ref, t) => {
  const tag = ref.current
  const { parentNode } = tag
  const msg = document.createElement('em')
  msg.innerText = t('copyFeedback')
  parentNode.replaceChild(msg, tag)
  setTimeout(() => parentNode.replaceChild(tag, msg), ms.seconds(2))
}

export default connect(
  'selectPeerLocationsForSwarm',
  'selectSelectedPeers',
  withTranslation('peers')(PeersTable)
)

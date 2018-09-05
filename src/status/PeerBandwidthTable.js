import React, { Component } from 'react'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import CountryFlag from 'react-country-flag'
import Box from '../components/box/Box'
import { Title } from './Commons'
import ComponentLoader from '../loader/ComponentLoader.js'

const humansize = filesize.partial({ round: 0 })

export class PeerBandwidthTable extends Component {
  static propTypes = {
    peerBandwidthPeers: PropTypes.array.isRequired,
    peerLocations: PropTypes.object.isRequired
  }

  state = {
    sort: { field: 'rateOut', direction: -1 },
    showAll: false
  }

  getSorter ({ field, direction }) {
    return (a, b) => {
      if (a.bw[field].gt(b.bw[field])) return direction
      if (a.bw[field].lt(b.bw[field])) return -direction
      return 0
    }
  }

  onFieldClick = (e) => {
    const field = e.currentTarget.getAttribute('data-field')
    this.setState(({ sort }) => {
      const direction = sort.field === field ? -sort.direction : -1
      return { sort: { field, direction } }
    })
  }

  onShowAllClick = () => {
    this.setState({ showAll: true })
  }

  render () {
    const { peerBandwidthPeers, className, peerLocations } = this.props
    const { sort, showAll } = this.state
    const sortedPeers = Array.from(peerBandwidthPeers)
      .filter(p => Boolean(p.bw))
      .sort(this.getSorter(sort))

    const visiblePeers = showAll ? sortedPeers : sortedPeers.slice(0, 5)
    const hiddenPeers = showAll ? [] : sortedPeers.slice(5)

    return sortedPeers.length === 0 ? (
      <ComponentLoader pastDelay />
    ) : (
      <Box className={className}>
        <Title>Bandwidth by peer</Title>
        <table className='collapse'>
          <tbody>
            <tr className='tl'>
              <th className='f6 pv2 pr3 pl0' colSpan='2'><span className='v-mid'>Peer</span></th>
              <SortableTableHeader field='rateIn' label='Rate In' sort={sort} onClick={this.onFieldClick} />
              <SortableTableHeader field='rateOut' label='Rate Out' sort={sort} onClick={this.onFieldClick} />
              <SortableTableHeader field='totalIn' label='Total In' sort={sort} onClick={this.onFieldClick} />
              <SortableTableHeader field='totalOut' label='Total Out' sort={sort} onClick={this.onFieldClick} />
            </tr>
            {visiblePeers.map((p, i) => (
              <tr key={p.id} className={i % 2 ? 'bg-snow-muted' : ''}>
                <td className='f6 pv2 nowrap'><LocationFlag location={peerLocations[p.id]} /></td>
                <td className='f6 pv2 ph3 w-100 monospace'>{p.id}</td>
                <td className='f6 pv2 ph3 nowrap'>{humansize(parseInt(p.bw.rateIn.toFixed(0), 10))}/s</td>
                <td className='f6 pv2 ph3 nowrap'>{humansize(parseInt(p.bw.rateOut.toFixed(0), 10))}/s</td>
                <td className='f6 pv2 ph3 nowrap'>{humansize(parseInt(p.bw.totalIn.toFixed(0), 10))}</td>
                <td className='f6 pv2 ph3 nowrap'>{humansize(parseInt(p.bw.totalOut.toFixed(0), 10))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!showAll && hiddenPeers.length ? (
          <p className='sans-serif f5 ma0 pv3 ph2 tc pointer underline-hover navy-muted' onClick={this.onShowAllClick}>...and {hiddenPeers.length} more</p>
        ) : null}
      </Box>
    )
  }
}

function SortableTableHeader ({ field, label, sort, onClick }) {
  return (
    <th className='pv2 ph3 pointer underline-hover nowrap' onClick={onClick} data-field={field}>
      <span className='f6 v-mid'>{label}</span>
      <SortArrow field={field} sortField={sort.field} direction={sort.direction} />
    </th>
  )
}

function SortArrow ({ field, sortField, direction }) {
  if (field !== sortField) return null
  const src = `https://icon.now.sh/triangle${direction === 1 ? 'Up' : 'Down'}`
  return <img src={src} className='v-mid' alt={'Sorted ' + (direction === 1 ? 'ascending' : 'descending')} />
}

function LocationFlag ({ location }) {
  if (!location) return '🏳️‍🌈'
  return (
    <span title={location.country_name}>
      <CountryFlag code={location.country_code} />
    </span>
  )
}

export default connect('selectPeerBandwidthPeers', 'selectPeerLocations', PeerBandwidthTable)

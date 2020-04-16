import React, { useCallback, useState, useMemo } from 'react'
import ReactFauxDOM from 'react-faux-dom'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import * as d3 from 'd3'
import CountryFlag from 'react-country-flag'

import staticMapSrc from './StaticMap.svg'

import Popover from '../../components/popover/Popover'

// Styles
import './WorldMap.css'
import Cid from '../../components/cid/Cid'

const WorldMap = ({ t, className, selectedPeer, doSetSelectedPeer }) => {
  const [selectedTimeout, setSelectedTimeout] = useState(null)

  // Caluate a sensible size for the map
  const { innerWidth } = window
  // the d3 generated svg width includes a lot of ocean, that we crop for now, as it looks weird.
  const svgWidthOversizeFactor = 1.7
  // remove a constant amount for the chrome that surronds the map.
  const sidebarAndPadding = 350
  const availableWidth = innerWidth - sidebarAndPadding
  let width = availableWidth * svgWidthOversizeFactor
  // if the map gets too big the dots get lost in the dot grid, also it just overloads the viewers brain.
  if (width > 3000) {
    width = 3000
  }
  // if the map gets too small it becomes illegible. There will be some map cropping on mobile.
  if (width < 700) {
    width = 700
  }
  // the map has a native proportion, so account for that when we set the height.
  const height = width * 0.273

  const handleMapPinMouseEnter = useCallback((peerId, element) => {
    if (!element) return

    clearTimeout(selectedTimeout)

    const { x, y, width, height } = element.getBBox()

    console.log('Peer', peerId)

    doSetSelectedPeer({ peerId, left: `${x + width / 2}px`, top: `${y - height / 2}px` })
  }, [doSetSelectedPeer, selectedTimeout])

  const handleMapPinMouseLeave = useCallback((id) => {
    setSelectedTimeout(
      setTimeout(() => doSetSelectedPeer({}), 400)
    )
  }, [doSetSelectedPeer])

  return (
    <div className={`relative ${className}`}>
      <div className='mb4 overflow-hidden flex flex-column items-center'>
        <div className="relative" style={{ width, height, background: `transparent url(${staticMapSrc}) center no-repeat`, backgroundSize: 'auto 100%' }}>
          <GeoPath width={width} height={height}>
            { ({ path }) => (
              <MapPins width={width} height={height} path={path} handleMouseEnter={ handleMapPinMouseEnter } handleMouseLeave= { handleMapPinMouseLeave } />
            )}
          </GeoPath>
          { selectedPeer && selectedPeer.peerId && (
            <Popover show={ !!(selectedPeer.top && selectedPeer.left) } top={ selectedPeer.top } left={ selectedPeer.left } align='top'>
              <PeerInfo id={ selectedPeer.peerId }/>
            </Popover>)
          }
        </div>
      </div>
      <div className='mapFooter absolute bottom-0 left-0 right-0'>
        <div className='flex flex-auto flex-column items-center self-end pb5-ns no-select'>
          <div className='f1 fw5 black'><PeersCount /></div>
          <div className='f4 b ttu charcoal-muted'>{t('peers')}</div>
        </div>
      </div>
    </div>
  )
}

const PeersCount = connect('selectPeers', ({ peers }) => peers ? peers.length : 0)

const GeoPath = ({ width, height, children }) => {
  // https://github.com/d3/d3-geo/blob/master/README.md#geoEquirectangular
  const projection = d3.geoEquirectangular()
    .scale(height / Math.PI)
    .translate([width / 2, height / 2])
    .precision(0.1)
  // https://github.com/d3/d3-geo/blob/master/README.md#paths
  const path = d3.geoPath().projection(projection)

  return children({ path })
}

// Just the dots on the map, this gets called a lot.
const MapPins = connect('selectPeerCoordinates', ({ width, height, path, peerCoordinates, handleMouseEnter, handleMouseLeave }) => {
  const el = d3.select(ReactFauxDOM.createElement('svg'))
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

  peerCoordinates.forEach(({ peerId, coordinates }) => {
    el.append('path')
      .datum({
        type: 'Point',
        coordinates: coordinates
      })
      .attr('d', path.pointRadius((d) => 8))
      .attr('fill', 'rgba(93, 213, 218, 0.4)')
      .on('mouseenter', () => handleMouseEnter(peerId, d3.event.relatedTarget))
      .on('mouseleave', () => handleMouseLeave(peerId))

    el.append('path')
      .datum({
        type: 'Point',
        coordinates: coordinates
      })
      .attr('class', 'visualPath')
      .attr('d', path.pointRadius((d) => 3))
      .attr('fill', 'rgb(93, 213, 218)')
  })

  return el.node().toReact()
})

const PeerInfo = connect('selectPeerLocationsForSwarm', ({ id, peerLocationsForSwarm: peers }) => {
  if (!peers) return null

  const peer = peers.find(({ peerId }) => peerId === id)

  if (!peer) return null

  const isWindows = useMemo(() => window.navigator.appVersion.indexOf('Win') !== -1, [])

  return (
    <div>
      <CountryFlag code={peer.flagCode} svg={isWindows} /><Cid value={peer.peerId}></Cid>
    </div>
  )
})

export default connect(
  'selectSelectedPeer',
  'doSetSelectedPeer',
  withTranslation('peers')(WorldMap)
)

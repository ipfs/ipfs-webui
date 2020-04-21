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

const WorldMap = ({ t, className, selectedPeers, doSetSelectedPeers }) => {
  const [selectedTimeout, setSelectedTimeout] = useState(null)

  // Calculate a sensible size for the map
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

  const handleMapPinMouseEnter = useCallback((peerIds, element) => {
    if (!element) return

    clearTimeout(selectedTimeout)

    const { x, y, width, height } = element.getBBox()

    doSetSelectedPeers({ peerIds, left: `${x + width / 2}px`, top: `${y - height / 2}px` })
  }, [doSetSelectedPeers, selectedTimeout])

  const handleMapPinMouseLeave = useCallback((id) => {
    setSelectedTimeout(
      setTimeout(() => doSetSelectedPeers({}), 400)
    )
  }, [doSetSelectedPeers])

  const handlePopoverMouseEnter = useCallback(() => clearTimeout(selectedTimeout), [selectedTimeout])

  return (
    <div className={`relative ${className}`}>
      <div className='mb4 flex flex-column items-center'>
        <div className="relative" style={{ width, height, background: `transparent url(${staticMapSrc}) center no-repeat`, backgroundSize: 'auto 100%' }}>
          <GeoPath width={width} height={height}>
            { ({ path }) => (
              <MapPins width={width} height={height} path={path} handleMouseEnter={ handleMapPinMouseEnter } handleMouseLeave= { handleMapPinMouseLeave } />
            )}
          </GeoPath>
          { selectedPeers?.peerIds && (
            <Popover show={ !!(selectedPeers.top && selectedPeers.left) } top={ selectedPeers.top } left={ selectedPeers.left } align='top'
              handleMouseEnter={ handlePopoverMouseEnter } handleMouseLeave={ handleMapPinMouseLeave }>
              <PeerInfo ids={ selectedPeers.peerIds }/>
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
      <div className='absolute bottom-1 right-1'>
        <div className='f6 p2 no-select flex items-center'>
          <i className='mapDotExplanation mr1' style={{ width: getDotsSize(1), height: getDotsSize(1), backgroundColor: getDotsColor(1) }}></i>1-10 {t('peers')}
          <i className='mapDotExplanation ml3 mr1' style={{ width: getDotsSize(100), height: getDotsSize(100), backgroundColor: getDotsColor(100) }}></i> 10-300 {t('peers')}
          <i className='mapDotExplanation ml3 mr1' style={{ width: getDotsSize(1100), height: getDotsSize(1100), backgroundColor: getDotsColor(1100) }}></i>300+ {t('peers')}
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

const getDotsSize = (numberOfDots) => {
  if (numberOfDots < 10) return 5
  if (numberOfDots < 300) return 8
  return 10
}

const getDotsColor = (numberOfDots) => {
  if (numberOfDots < 10) return 'rgba(150, 204, 255, 0.6)'
  if (numberOfDots < 300) return 'rgba(53, 126, 221, 0.6)'
  return 'rgba(53, 126, 221, 0.8)'
}

// Just the dots on the map, this gets called a lot.
const MapPins = connect('selectPeersCoordinates', ({ width, height, path, peersCoordinates, handleMouseEnter, handleMouseLeave }) => {
  const el = d3.select(ReactFauxDOM.createElement('svg'))
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

  peersCoordinates.forEach(({ peerIds, coordinates }) => {
    el.append('path')
      .datum({
        type: 'Point',
        coordinates: coordinates
      })
      .attr('d', path.pointRadius(() => getDotsSize(peerIds.length)))
      .attr('fill', () => getDotsColor(peerIds.length))
      .on('mouseenter', () => handleMouseEnter(peerIds, d3.event.relatedTarget))
      .on('mouseleave', () => handleMouseLeave(peerIds))
  })

  return el.node().toReact()
})

const MAX_PEERS = 5

const PeerInfo = connect('selectPeerLocationsForSwarm', ({ ids, peerLocationsForSwarm: allPeers }) => {
  if (!allPeers) return null

  const peers = allPeers.filter(({ peerId }) => ids.includes(peerId))

  if (!peers.length) return null

  const isWindows = useMemo(() => window.navigator.appVersion.indexOf('Win') !== -1, [])

  return (
    <div className="f6 flex flex-column-reverse">
      { peers.map((peer, index) => {
        if (index === MAX_PEERS && peers.length > MAX_PEERS) {
          return (<div className="f7 pa2 pt3" key="worldmap-more-label">+{peers.length - MAX_PEERS}</div>)
        }

        if (index > MAX_PEERS) return null

        return (
          <div className="pa2" key={peer.peerId}>
            <CountryFlag code={peer.flagCode} svg={isWindows} />{peer.address}/p2p/<Cid value={peer.peerId}/> ({peer.latency}ms)
          </div>
        )
      })

      }
      { peers.length === MAX_PEERS}
    </div>
  )
})

export default connect(
  'selectSelectedPeers',
  'doSetSelectedPeers',
  withTranslation('peers')(WorldMap)
)

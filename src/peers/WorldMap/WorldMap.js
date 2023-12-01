import React, { useCallback, useState, useMemo, useEffect } from 'react'
import ReactFauxDOM from 'react-faux-dom'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import * as d3 from 'd3'
import CountryFlag from 'react-country-flag'
import { debounce } from 'redux-bundler'

import staticMapSrc from './StaticMap.svg'

import Address from '../../components/address/Address.js'
import Popover from '../../components/popover/Popover.js'

// Styles
import './WorldMap.css'
import Cid from '../../components/cid/Cid.js'

const calculateWidth = (windowWidth) => {
  // the d3 generated svg width includes a lot of ocean, that we crop for now, as it looks weird.
  const svgWidthOversizeFactor = 1.7
  // remove a constant amount for the chrome that surronds the map.
  const sidebarAndPadding = 350
  const availableWidth = windowWidth - sidebarAndPadding
  const width = availableWidth * svgWidthOversizeFactor
  // if the map gets too big the dots get lost in the dot grid, also it just overloads the viewers brain.
  if (width > 3000) {
    return 3000
  }
  // if the map gets too small it becomes illegible. There will be some map cropping on mobile.
  if (width < 700) {
    return 700
  }

  return width
}

const calculateHeight = (width) => {
  if (width > 960) {
    if (window.innerHeight < 940) {
      return (window.innerHeight - 180) * 0.6
    }
    return width * 0.273
  }

  return width * 0.5
}

const WorldMap = ({ t, className, selectedPeers, doSetSelectedPeers }) => {
  const [width, setWidth] = useState(calculateWidth(window.innerWidth))
  const [height, setHeight] = useState(calculateHeight(width))
  const [selectedTimeout, setSelectedTimeout] = useState(null)

  useEffect(() => {
    const debouncedHandleResize = debounce(() => {
      const width = calculateWidth(window.innerWidth)
      setWidth(width)
      setHeight(calculateHeight(width))
    }, 100)

    window.addEventListener('resize', debouncedHandleResize)

    return () => window.removeEventListener('resize', debouncedHandleResize)
  })

  const handleMapPinMouseEnter = useCallback((peerIds, element) => {
    if (!element) return

    clearTimeout(selectedTimeout)

    const { x, y, width, height } = element.getBBox()

    doSetSelectedPeers({ peerIds, left: `${x + width / 2}px`, top: `${y - height / 2}px` })
  }, [doSetSelectedPeers, selectedTimeout])

  const handleMapPinMouseLeave = useCallback(() => {
    setSelectedTimeout(
      setTimeout(() => doSetSelectedPeers({}), 600)
    )
  }, [doSetSelectedPeers])

  const handlePopoverMouseEnter = useCallback(() => clearTimeout(selectedTimeout), [selectedTimeout])

  return (
    <div className="flex flex-column">
      <div className={`relative ${className}`}>
        <div className='mb1 flex flex-column items-center'>
          <div className="relative no-events" style={{ width, height, background: `transparent url(${staticMapSrc}) center no-repeat`, backgroundSize: 'auto 100%' }}>
            <GeoPath width={width} height={height}>
              { ({ path }) => (
                <MapPins width={width} height={height} path={path} handleMouseEnter={ handleMapPinMouseEnter } handleMouseLeave= { handleMapPinMouseLeave } />
              )}
            </GeoPath>
            { selectedPeers?.peerIds && (
              <Popover show={ !!(selectedPeers.top && selectedPeers.left) } top={ selectedPeers.top } left={ selectedPeers.left } align='bottom'
                handleMouseEnter={ handlePopoverMouseEnter } handleMouseLeave={ handleMapPinMouseLeave }>
                <PeerInfo ids={ selectedPeers.peerIds } t={t}/>
              </Popover>)
            }
          </div>
        </div>
        <div className='no-events absolute bottom-0 left-0 right-0'>
          <div className='flex flex-auto flex-column items-center self-end pb5-ns no-select'>
            <div className='f1 fw5 black'><PeersCount /></div>
            <div className='f4 b ttu charcoal-muted'>{t('app:terms.peers')}</div>
          </div>
        </div>
      </div>
      <div className='relative flex justify-end pt2 pb4'>
        <div className='f6 p2 no-select flex items-center'>
          <span className='f6 charcoal-muted pr3'>{t('app:terms.peers')}: </span>
          <i className='mapDotExplanation mr1' style={{ width: getDotsSize(1) * 2, height: getDotsSize(1) * 2, backgroundColor: getDotsColor(1) }}></i>1-10
          <i className='mapDotExplanation ml3 mr1' style={{ width: getDotsSize(50) * 2, height: getDotsSize(50) * 2, backgroundColor: getDotsColor(50) }}></i> 10-100
          <i className='mapDotExplanation ml3 mr1' style={{ width: getDotsSize(110) * 2, height: getDotsSize(110) * 2, backgroundColor: getDotsColor(110) }}></i>100+
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
  if (numberOfDots < 100) return 8
  return 10
}

const getDotsColor = (numberOfDots) => {
  if (numberOfDots < 10) return 'rgba(150, 204, 255, 0.6)'
  if (numberOfDots < 100) return 'rgba(53, 126, 221, 0.6)'
  return 'rgba(53, 126, 221, 0.8)'
}

// Just the dots on the map, this gets called a lot.
const MapPins = connect('selectPeersCoordinates', ({ width, height, path, peersCoordinates, handleMouseEnter, handleMouseLeave }) => {
  const [awaitedPeerCoordinates, setAwaitedPeerCoordinates] = useState([])
  const el = d3.select(ReactFauxDOM.createElement('svg'))
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

  useEffect(() => {
    const asyncFn = async () => {
      setAwaitedPeerCoordinates(await peersCoordinates)
    }
    asyncFn()
  }, [peersCoordinates])

  awaitedPeerCoordinates.forEach(({ peerIds, coordinates }) => {
    el.append('path')
      .datum({
        type: 'Point',
        coordinates
      })
      .attr('d', path.pointRadius(() => getDotsSize(peerIds.length)))
      .attr('fill', () => getDotsColor(peerIds.length))
      .attr('class', 'mapDot')
      .on('mouseenter', () => handleMouseEnter(peerIds, d3.event.relatedTarget))
      .on('mouseleave', () => handleMouseLeave())
  })

  return el.node().toReact()
})

const MAX_PEERS = 5

const PeerInfo = connect('selectPeerLocationsForSwarm', ({ ids, peerLocationsForSwarm, t }) => {
  const [allPeers, setAllPeers] = useState([])

  useEffect(() => {
    if (!peerLocationsForSwarm) return
    const asyncFn = async () => {
      setAllPeers(await peerLocationsForSwarm)
    }
    asyncFn()
  }, [peerLocationsForSwarm])

  const peers = allPeers.filter(({ peerId }) => ids.includes(peerId))

  const isWindows = useMemo(() => window.navigator.appVersion.indexOf('Win') !== -1, [])

  if (!peers.length) return null
  if (!peerLocationsForSwarm) return null

  return (
    <div className="f6 flex flex-column justify-center">
      { peers.sort((a, b) => a.address.localeCompare(b.address)).map((peer, index) => {
        if (index === MAX_PEERS && peers.length > MAX_PEERS) {
          return (<div className="f7 pa1 self-end" key="worldmap-more-label">{t('plusPeers', { number: peers.length - MAX_PEERS })}</div>)
        }

        if (index > MAX_PEERS) return null

        return (
          <div className="pa2 f7 flex items-center monospace" key={peer.peerId}>
            <CountryFlag className='mr1' code={peer.flagCode} svg={isWindows}/>
            <div className="flex flex-auto items-center">
              <Address value={ peer.address }/>
              <span className="charcoal-muted">/p2p/</span>
              <Cid value={peer.peerId}/>
            </div>
            <span className="gray ml1"> ({peer.latency || '???'}ms)</span>
          </div>
        )
      }) }
    </div>
  )
})

export default connect(
  'selectSelectedPeers',
  'doSetSelectedPeers',
  withTranslation('peers')(WorldMap)
)

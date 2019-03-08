import React from 'react'
import ReactFauxDOM from 'react-faux-dom'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import * as d3 from 'd3'
import staticMapSrc from './StaticMap.svg'

const WorldMap = ({ t, className }) => {
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
    width = 3300
  }
  // if the map gets too small it becomes illegible. There will be some map cropping on mobile.
  if (width < 700) {
    width = 700
  }
  // the map has a native proportion, so account for that when we set the height.
  let height = width * 0.273
  return (
    <div className={`relative ${className}`}>
      <div className='mb4 overflow-hidden flex flex-column items-center'>
        <div style={{ width, height, background: `transparent url(${staticMapSrc}) center no-repeat`, backgroundSize: 'auto 100%' }}>
          <GeoPath width={width} height={height}>
            { ({ path }) => (
              <MapPins width={width} height={height} path={path} />
            )}
          </GeoPath>
        </div>
      </div>
      <div className='absolute bottom-0 left-0 right-0'>
        <div className='flex flex-auto flex-column items-center self-end pb5-ns'>
          <div className='f1 fw5 aqua'><PeersCount /></div>
          <div className='f4 b ttu'>{t('peers')}</div>
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
const MapPins = connect('selectPeerCoordinates', ({ width, height, path, peerCoordinates }) => {
  const el = d3.select(ReactFauxDOM.createElement('svg'))
    .attr('width', width)
    .attr('height', height)

  el.append('path')
    .datum({
      type: 'MultiPoint',
      coordinates: peerCoordinates
    })
    .attr('d', path.pointRadius((d) => 8))
    .attr('fill', 'rgba(93, 213, 218, 0.4)')

  el.append('path')
    .datum({
      type: 'MultiPoint',
      coordinates: peerCoordinates
    })
    .attr('d', path.pointRadius((d) => 3))
    .attr('fill', 'rgb(93, 213, 218)')

  return el.node().toReact()
})

export default translate('peers')(WorldMap)

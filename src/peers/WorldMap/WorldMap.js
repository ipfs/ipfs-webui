import React from 'react'
import ReactFauxDOM from 'react-faux-dom'
import { connect } from 'redux-bundler-react'
import { AutoSizer } from 'react-virtualized'
import { translate } from 'react-i18next'
import * as d3 from 'd3'
import * as topojson from 'topojson'

import worldData from './world.json'

const WorldMap = ({ t }) => {
  return (
    <div className='flex w-100 mb4' style={{ 'height': '550px' }}>
      <AutoSizer>
        { ({ height, width }) => (
          <GeoPath width={width} height={height}>
            { ({ path }) => (
              <div className='relative'>
                <Map height={height} width={width} path={path} />
                <div className='absolute top-0'>
                  <MapPins height={height} width={width} path={path} />
                </div>
              </div>
            )}
          </GeoPath>
        )}
      </AutoSizer>
      <div className='flex flex-auto flex-column items-center self-end pb5'>
        <div className='f1 fw5 aqua'><PeersCount /></div>
        <div className='f4 b ttu'>{t('peers')}</div>
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

// Earth! It's complicated, so try not to re-render so much
const Map = ({ width, height, path }) => {
  // https://github.com/d3/d3-geo/blob/master/README.md#geoGraticule
  const graticule = d3.geoGraticule()

  const el = d3.select(ReactFauxDOM.createElement('svg'))
    .attr('width', width)
    .attr('height', height)

  // Fill Pattern
  el.append('defs')
    .append('pattern')
    .attr('id', 'gridpattern')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 5)
    .attr('height', 5)
    .attr('patternUnits', 'userSpaceOnUse')
    .append('circle')
    .attr('cx', 3)
    .attr('cy', 3)
    .attr('r', 1)
    .attr('fill', '#AAA')
    .attr('stroke', '#DDD')

  el.append('path')
    .datum(graticule)
    .attr('class', 'graticule')
    .attr('d', path)

  el.insert('path', '.graticule')
    .datum(topojson.feature(worldData, worldData.objects.land))
    .attr('d', path)
    .attr('fill', 'url(#gridpattern)')

  el.insert('path', '.graticule')
    .datum(topojson.mesh(
      worldData,
      worldData.objects.countries,
      (a, b) => a !== b
    ))
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'none')

  return el.node().toReact()
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

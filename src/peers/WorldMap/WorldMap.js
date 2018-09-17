import React from 'react'
import PropTypes from 'prop-types'
import ReactFauxDOM from 'react-faux-dom'
import { AutoSizer } from 'react-virtualized'
import { translate } from 'react-i18next'
import * as d3 from 'd3'
import * as topojson from 'topojson'

// Static
import worldData from './world.json'

export class WorldMap extends React.Component {
  static propTypes = {
    peers: PropTypes.array,
    coordinates: PropTypes.array
  }

  renderMap = (height, width, coordinates) => {
    // https://github.com/d3/d3-geo/blob/master/README.md#geoEquirectangular
    const projection = d3.geoEquirectangular()
      .scale(height / Math.PI)
      .translate([width / 2, height / 2])
      .precision(0.1)

    // https://github.com/d3/d3-geo/blob/master/README.md#paths
    const path = d3.geoPath().projection(projection)

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

    el.append('path')
      .datum({
        type: 'MultiPoint',
        coordinates: coordinates
      })
      .attr('d', path.pointRadius((d) => 10))
      .attr('fill', 'rgba(93, 213, 218, 0.4)')

    el.append('path')
      .datum({
        type: 'MultiPoint',
        coordinates: coordinates
      })
      .attr('d', path.pointRadius((d) => 3))
      .attr('fill', 'rgb(93, 213, 218)')

    return el.node().toReact()
  }

  render () {
    const { t, peers, coordinates } = this.props

    return (
      <div className='flex w-100 mb4' style={{ 'height': '550px' }}>
        <AutoSizer>
          { ({ height, width }) => this.renderMap(height, width, coordinates) }
        </AutoSizer>

        <div className='flex flex-auto flex-column items-center self-end pb5'>
          <div className='f1 fw5 aqua'>{ peers ? peers.length : 0 }</div>
          <div className='f4 b ttu'>{t('peers')}</div>
        </div>
      </div>
    )
  }
}

export default translate('peers')(WorldMap)

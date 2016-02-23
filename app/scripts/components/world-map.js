import React, {Component, PropTypes} from 'react'
import d3 from 'd3'
import topojson from 'topojson'
import {AutoSizer} from 'react-virtualized'
import ReactFauxDOM from 'react-faux-dom'

import worldData from '../../data/world.json'

export default class WorldMap extends Component {
  static propTypes = {
    coordinates: PropTypes.array.isRequired
  };

  _renderMap = ({width, height}) => {
    const projection = d3.geo.equirectangular()
            .scale(height / Math.PI)
            .translate([width / 2, height / 2])
            .precision(0.1)

    const path = d3.geo.path()
            .projection(projection)

    const graticule = d3.geo.graticule()

    const el = d3.select(ReactFauxDOM.createElement('svg'))
            .attr('width', width)
            .attr('height', height)

    // Fill Pattern
    el.append('defs')
      .append('pattern')
      .attr('id', 'gridpattern')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 4)
      .attr('height', 4)
      .attr('patternUnits', 'userSpaceOnUse')
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 1)
      .attr('style', 'stroke: none; fill: rgba(255, 255, 255, 0.7)')

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
      .attr('stroke-width', '0.5px')

    el.append('path')
      .datum({
        type: 'MultiPoint',
        coordinates: this.props.coordinates
      })
      .attr('d', path.pointRadius((d) => 8))
      .attr('class', 'world-locations-base')

    el.append('path')
      .datum({
        type: 'MultiPoint',
        coordinates: this.props.coordinates
      })
      .attr('d', path.pointRadius((d) => 2))
      .attr('class', 'world-locations-center')

    return el.node().toReact()
  };

  render () {
    return <AutoSizer>{this._renderMap}</AutoSizer>
  }
}

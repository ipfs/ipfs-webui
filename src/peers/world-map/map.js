import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import ReactFauxDOM from 'react-faux-dom'
import worldData from './world.json'

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

export default Map

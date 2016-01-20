import React, {Component} from 'react'
import d3 from 'd3'

const diameter = 500
const radius = diameter / 2
const margin = 60
const center = radius + margin / 2

export
default class DHTGraph extends Component {
  state = {
    initialized: false
  };

  static displayName = 'DHTGraph';
  static propTypes = {
    peers: React.PropTypes.array
  };

  update = () => {
    const data = this.props.peers
    let svg = this.state.svg

    svg.append('circle')
      .attr('r', radius)
      .attr('class', 'outer')

    let main = svg.append('g')

    const projection = d => {
      let a = d.pos / 180 * Math.PI
      return [radius * Math.cos(a), radius * Math.sin(a)]
    }

    const line = d3.svg.line()
      .interpolate('bundle')
      .tension(0.6)

    main.append('g').selectAll('path')
      .data(data.slice(1))
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d => {
        let start = projection(d)
        let end = projection(data[0])
        return line([start, [0, 0], end])
      })

    main.append('g').selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', 12)
      .attr('transform', d => {
        return 'rotate(' + d.pos + ')translate(' + radius + ')'
      })

    // main.append('g').selectAll('text')
    //   .data(data)
    //   .enter().append('text')
    //     .attr('class', 'label')
    //     .attr('x', function (d){ return radius * Math.cos(d.pos / 180 * Math.PI) })
    //     .attr('y', function (d){ return radius * Math.sin(d.pos / 180 * Math.PI) })
    //     .attr('text-anchor', 'middle')
    //     .attr('dx', 32)
    //     .attr('dy', 4)
    //     .text(function (d){ return d.id })
    d3.select(window.frameElement).style('height', (diameter + margin) + 'px')
  };

  componentDidMount () {
    const svg = d3.select('.dht-graph')
      .append('svg')
      .attr('width', diameter + margin)
      .attr('height', diameter + margin)
      .attr('class', 'centered')
      .style('display', 'block')
      .append('g')
      .attr('transform', 'translate(' + center + ',' + center + ')')

    this.setState({
      initialized: true,
      svg
    })

    this.update()
  }

  render () {
    if (this.state.initialized) this.update()
    return <div className='dht-graph centered'/>
  }
}

var React = require('react')
var d3 = require('d3')

var diameter = 500,
  radius = diameter / 2,
  margin = 60,
  center = radius + margin / 2

var DHTGraph = React.createClass({
  displayName: 'DHTGraph',
  propTypes: {
    peers: React.PropTypes.array
  },
  getInitialState: function () {
    return { initialized: false }
  },

  update: function () {
    var data = this.props.peers
    var svg = this.state.svg

    svg.append('circle')
      .attr('r', radius)
      .attr('class', 'outer')

    var main = svg.append('g')

    function projection (d) {
      var a = d.pos / 180 * Math.PI
      return [radius * Math.cos(a), radius * Math.sin(a)]
    }

    var line = d3.svg.line()
      .interpolate('bundle')
      .tension(0.6)

    main.append('g').selectAll('path')
      .data(data.slice(1))
      .enter().append('path')
        .attr('class', 'link')
        .attr('d', function (d) {
          var start = projection(d),
            end = projection(data[0])
          return line([ start, [0, 0], end ])
        })

    main.append('g').selectAll('circle')
      .data(data)
      .enter().append('circle')
        .attr('class', 'node')
        .attr('r', 12)
        .attr('transform', function (d) { return 'rotate(' + d.pos + ')translate(' + radius + ')' })

    /*main.append('g').selectAll('text')
      .data(data)
      .enter().append('text')
        .attr('class', 'label')
        .attr('x', function (d){ return radius * Math.cos(d.pos / 180 * Math.PI) })
        .attr('y', function (d){ return radius * Math.sin(d.pos / 180 * Math.PI) })
        .attr('text-anchor', 'middle')
        .attr('dx', 32)
        .attr('dy', 4)
        .text(function (d){ return d.id })*/

    d3.select(window.frameElement).style('height', (diameter + margin) + 'px')
  },

  componentDidMount: function () {
    var svg = d3.select('.dht-graph').append('svg')
        .attr('width', diameter + margin)
        .attr('height', diameter + margin)
        .attr('class', 'centered')
        .style('display', 'block')
      .append('g')
        .attr('transform', 'translate(' + center + ',' + center + ')')

    this.setState({
      initialized: true,
      svg: svg
    })

    this.update()
  },

  render: function () {
    if (this.state.initialized) this.update()
    return <div className='dht-graph centered'></div>
  }
})

module.exports = DHTGraph

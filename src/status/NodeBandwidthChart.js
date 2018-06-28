import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import filesize from 'filesize'

const humansize = filesize.partial({ round: 0 })

export class NodeBandwidthChart extends Component {
  static propTypes = {
    nodeBandwidthChartData: PropTypes.array.isRequired,
    animatedPoints: PropTypes.number
  }

  state = {}

  static defaultProps = {
    animatedPoints: 500 // Only animate for the first 500 points
  }

  render () {
    const { nodeBandwidthChartData } = this.props

    if (!nodeBandwidthChartData.length) {
      return <p className='sans-serif f3 ma0 pv1 ph2 tc'>Loading...</p>
    }

    const dataset = {
      label: 'Total bandwidth',
      data: nodeBandwidthChartData,
      borderColor: '#69c4cd',
      backgroundColor: '#9ad4db',
      pointRadius: 2,
      cubicInterpolationMode: 'monotone'
    }

    const options = {
      responsive: true,
      tooltips: { mode: 'nearest' },
      scales: {
        xAxes: [{ type: 'time' }],
        yAxes: [{
          ticks: {
            callback: v => humansize(v) + '/s'
          }
        }]
      },
      legend: {
        display: true,
        position: 'bottom',
        reverse: true
      },
      animation: {
        // Only animate the 500 points
        duration: nodeBandwidthChartData.length <= this.props.animatedPoints ? 1000 : 0
      }
    }

    return (
      <div>
        <h2>Node bandwidth usage</h2>
        <Line data={{ datasets: [dataset] }} options={options} />
      </div>
    )
  }
}

export default connect('selectNodeBandwidthChartData', NodeBandwidthChart)

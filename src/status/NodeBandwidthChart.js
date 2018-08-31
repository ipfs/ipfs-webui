import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import { Title } from './Commons'
import Box from '../components/box/Box'

const humansize = filesize.partial({ round: 0 })

export class NodeBandwidthChart extends Component {
  static propTypes = {
    nodeBandwidthChartData: PropTypes.object.isRequired,
    animatedPoints: PropTypes.number
  }

  state = {}

  static defaultProps = {
    animatedPoints: 500 // Only animate for the first 500 points
  }

  render () {
    const { nodeBandwidthChartData } = this.props

    const datasets = [
      {
        label: 'In',
        data: nodeBandwidthChartData.in,
        borderColor: '#69c4cd',
        backgroundColor: '#9ad4db',
        pointRadius: 2,
        cubicInterpolationMode: 'monotone'
      },
      {
        label: 'Out',
        data: nodeBandwidthChartData.out,
        borderColor: '#f39021',
        backgroundColor: '#f9a13e',
        pointRadius: 2,
        cubicInterpolationMode: 'monotone'
      }
    ]

    const options = {
      defaultFontFamily: "'Inter UI', system-ui, sans-serif",
      responsive: true,
      tooltips: { mode: 'index' },
      hover: { mode: 'index' },
      scales: {
        xAxes: [{ type: 'time' }],
        yAxes: [{
          stacked: true,
          ticks: {
            callback: v => humansize(v) + '/s'
          }
        }]
      },
      legend: {
        display: true,
        position: 'bottom'
      },
      animation: {
        // Only animate the 500 points
        duration: nodeBandwidthChartData.in.length <= this.props.animatedPoints ? 1000 : 0
      }
    }

    return (
      <Box className={`pa4 pr2 ${this.props.className}`}>
        <Title>Bandwidth over time</Title>
        <Line data={{ datasets }} options={options} />
      </Box>
    )
  }
}

export default connect('selectNodeBandwidthChartData', NodeBandwidthChart)

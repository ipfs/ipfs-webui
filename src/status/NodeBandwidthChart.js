import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'
import { translate } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import { Title } from './Commons'

const humansize = filesize.partial({ round: 1, bits: true })

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
    const { t, nodeBandwidthChartData } = this.props

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
            callback: v => humansize(v) + '/s',
            suggestedMax: 125000
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
      <div>
        <Title>{t('bandwidthOverTime')}</Title>
        <Line data={{ datasets }} options={options} />
      </div>
    )
  }
}

export default connect('selectNodeBandwidthChartData', translate('status')(NodeBandwidthChart))

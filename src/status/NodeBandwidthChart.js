import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import { Title } from './Commons'
import Box from '../components/box/Box'

import Modal from '../components/modal/Modal'
import Overlay from '../components/overlay/Overlay'

const humansize = filesize.partial({ round: 1, bits: true })

export class NodeBandwidthChart extends Component {
  static propTypes = {
    nodeBandwidthChartData: PropTypes.object.isRequired,
    animatedPoints: PropTypes.number
  }

  state = {
    showModal: true
  }

  static defaultProps = {
    animatedPoints: 500 // Only animate for the first 500 points
  }

  toggleModal = () => {
    this.setState(s => ({ showModal: !s.showModal }))
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
      <Box className={`pa4 pr2 ${this.props.className}`}>
        <Title>Bandwidth over time</Title>
        <Line data={{ datasets }} options={options} />

        <Overlay show={this.state.showModal} autoFocus={false}>
          <Modal onCancel={this.toggleModal} style={{}}>
            <Box className={`pa4 pr2 ${this.props.className}`}>
              <Title>Bandwidth over time</Title>
              <Line data={{ datasets }} options={options} />
            </Box>
          </Modal>
        </Overlay>
      </Box>
    )
  }
}

export default connect('selectNodeBandwidthChartData', NodeBandwidthChart)

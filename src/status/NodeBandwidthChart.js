import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'
import { translate } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import { Title } from './Commons'
import Box from '../components/box/Box'

const humansize = filesize.partial({ round: 0, bits: true })

const Tooltip = ({ bw, show, pos }) => {
  if (!show) {
    return null
  }

  bw = {
    in: filesize(bw.in, { round: 0, bits: true, output: 'array' }),
    out: filesize(bw.out, { round: 0, bits: true, output: 'array' })
  }

  return (
    <div id='chartjs-tooltip' className='fixed bg-white pa2 br3 shadow-4' style={{ top: `${pos.top}px`, left: `${pos.left}px` }}>
      <div className='db'>
        <span className='w2 dib charcoal tr'>in:</span>
        <span className='f4 ml2 charcoal-muted'>{bw.in[0]}</span>
        <span className='ml1 charcoal-muted'>{bw.in[1]}/s</span>
      </div>
      <div className='db'>
        <span className='w2 dib charcoal tr'>out:</span>
        <span className='f4 ml2 charcoal-muted'>{bw.out[0]}</span>
        <span className='ml1 charcoal-muted'>{bw.out[1]}/s</span>
      </div>
    </div>
  )
}

export class NodeBandwidthChart extends Component {
  static propTypes = {
    nodeBandwidthChartData: PropTypes.object.isRequired,
    animatedPoints: PropTypes.number
  }

  state = {
    tooltip: { show: false }
  }

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

    const updateTooltip = (show, bw, pos) => {
      this.setState({
        tooltip: { show, bw, pos }
      })
    }

    const options = {
      defaultFontFamily: "'Inter UI', system-ui, sans-serif",
      responsive: true,
      tooltips: {
        mode: 'index',
        enabled: false,
        custom: function (model) {
          // FIX: this is NOT HAPPENING!?!?!?!
          if (model.opacity === 0) {
            updateTooltip(false)
            return
          }

          const lines = model.body
            .map(i => i.lines)
            .map(l => l[0].split(' ')[1])
            .map(n => parseInt(n, 10))

          const pos = this._chart.canvas.getBoundingClientRect()

          updateTooltip(true, { in: lines[0], out: lines[1] }, {
            left: pos.left + model.caretX,
            top: pos.top + model.caretY
          })
        }
      },
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
        <Title>{t('bandwidthOverTime')}</Title>
        <Tooltip {...this.state.tooltip} />
        <Line data={{ datasets }} options={options} />
      </Box>
    )
  }
}

export default connect('selectNodeBandwidthChartData', translate('status')(NodeBandwidthChart))

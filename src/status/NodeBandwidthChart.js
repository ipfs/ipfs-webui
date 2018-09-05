import React, { Component } from 'react'
import ReactDOM from 'react-dom'
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
    <div className='fixed bg-white pa2 br3 shadow-4' style={{ top: `${pos.top}px`, left: `${pos.left}px` }}>
      <div className='db'>
        <span style={{ width: '1.3rem' }} className='f7 dib charcoal tr'>in:</span>
        <span className='f4 ml1 charcoal-muted'>{bw.in[0]}</span>
        <span className='f7 charcoal-muted'>{bw.in[1]}/s</span>
      </div>
      <div className='db'>
        <span style={{ width: '1.3rem' }} className='f7 dib charcoal tr'>out:</span>
        <span className='f4 ml1 charcoal-muted'>{bw.out[0]}</span>
        <span className='f7 charcoal-muted'>{bw.out[1]}/s</span>
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
    tooltip: { show: false },
    backgrounds: {
      in: '#9ad4db',
      out: '#f9a13e'
    }
  }

  static defaultProps = {
    animatedPoints: 500 // Only animate for the first 500 points
  }

  componentDidMount () {
    const el = ReactDOM.findDOMNode(this.root)

    if (!el) {
      return
    }

    const ctx = el.getContext('2d')

    const gradientIn = ctx.createLinearGradient(el.width / 2, 0, el.width / 2, el.height)
    gradientIn.addColorStop(0, '#70c5cd')
    gradientIn.addColorStop(1, '#c6f1f3')

    const gradientOut = ctx.createLinearGradient(el.width / 2, 0, el.width / 2, el.height / 2)
    gradientOut.addColorStop(0, '#f19237')
    gradientOut.addColorStop(1, '#f9d1a6')

    this.setState({
      backgrounds: {
        in: gradientIn,
        out: gradientOut
      }
    })
  }

  render () {
    const { t, nodeBandwidthChartData } = this.props

    const datasets = [
      {
        label: 'In',
        data: nodeBandwidthChartData.in,
        borderColor: this.state.backgrounds.in,
        backgroundColor: this.state.backgrounds.in,
        pointRadius: 2,
        cubicInterpolationMode: 'monotone'
      },
      {
        label: 'Out',
        data: nodeBandwidthChartData.out,
        borderColor: this.state.backgrounds.out,
        backgroundColor: this.state.backgrounds.out,
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
          // f7 FIX: this is NOT HAPPENING!?!?!?!
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
        <Line data={{ datasets }} options={options} ref={el => { this.root = el }} />
      </Box>
    )
  }
}

export default connect('selectNodeBandwidthChartData', translate('status')(NodeBandwidthChart))

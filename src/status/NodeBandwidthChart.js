import React from 'react'
import ReactDOM from 'react-dom'
import { Line } from 'react-chartjs-2'
import { translate } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import { Title } from './Commons'
import Box from '../components/box/Box'

const defaultSettings = {
  defaultFontFamily: "'Inter UI', system-ui, sans-serif",
  responsive: true,
  tooltips: {
    mode: 'x',
    position: 'nearest',
    enabled: false,
    custom: function (model) {
      let tooltip = document.getElementById('node_bw_chart')
      const data = { show: true }

      if (!tooltip) {
        tooltip = document.createElement('div')
        tooltip.id = 'node_bw_chart'
        document.body.appendChild(tooltip)
      }

      if (model.opacity === 0) {
        data.show = false
      } else {
        const bw = {
          in: model.dataPoints[0].yLabel,
          out: model.dataPoints[1].yLabel
        }

        const rect = this._chart.canvas.getBoundingClientRect()
        const pos = {
          left: rect.left + model.caretX,
          top: rect.top + model.caretY
        }

        data.bw = bw
        data.pos = pos
      }

      // I know this isn't a very React-y way of doing this, but there was a simple issue:
      // re-rendering the tooltip was also re-rendering the chart which then lost its focus
      // state causing the Tooltip to stick and not disappear.
      ReactDOM.render(<Tooltip {...data} />, tooltip)
    }
  },
  hover: { mode: 'index' },
  scales: {
    xAxes: [{
      type: 'time',
      time: {
        minUnit: 'second'
      }
    }],
    yAxes: [{
      stacked: true,
      ticks: {
        callback: v => filesize(v, { round: 1, exponent: 2, bits: true }) + '/s',
        suggestedMax: 125000
      }
    }]
  },
  legend: {
    display: true,
    position: 'bottom'
  }
}

const Tooltip = ({ bw, show, pos }) => {
  if (!show) {
    return null
  }

  bw = {
    in: filesize(bw.in, { round: 0, bits: true, output: 'array' }),
    out: filesize(bw.out, { round: 0, bits: true, output: 'array' })
  }

  return (
    <div className='sans-serif absolute bg-white pa2 br3' style={{
      top: `${pos.top + window.scrollY}px`,
      left: `${pos.left}px`,
      transform: 'translateY(calc(-100% - 20px))',
      filter: 'drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.2))'
    }}>
      <div className='absolute' style={{
        bottom: '-14px',
        left: '0',
        width: '0',
        height: '0',
        borderTop: '20px solid white',
        borderRight: '20px solid transparent'
      }} />
      <table className='collapse'>
        <tr>
          <td className='f7 charcoal tr'>in:</td>
          <td>
            <span className='f4 ml1 charcoal-muted'>{bw.in[0]}</span>
            <span className='f7 charcoal-muted'>{bw.in[1]}/s</span>
          </td>
        </tr>
        <tr>
          <td className='f7 charcoal tr'>out:</td>
          <td>
            <span className='f4 ml1 charcoal-muted'>{bw.out[0]}</span>
            <span className='f7 charcoal-muted'>{bw.out[1]}/s</span>
          </td>
        </tr>
      </table>
    </div>
  )
}

function NodeBandwidthChart ({ t, animatedPoints, nodeBandwidthChartData, className }) {
  const data = (canvas) => {
    const ctx = canvas.getContext('2d')

    const gradientIn = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height)
    gradientIn.addColorStop(0, '#70c5cd')
    gradientIn.addColorStop(1, '#c6f1f3')

    const gradientOut = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height / 2)
    gradientOut.addColorStop(0, '#f19237')
    gradientOut.addColorStop(1, '#f9d1a6')

    return {
      datasets: [
        {
          label: 'In',
          data: nodeBandwidthChartData.in,
          borderColor: gradientIn,
          backgroundColor: gradientIn,
          pointRadius: 2,
          cubicInterpolationMode: 'monotone'
        },
        {
          label: 'Out',
          data: nodeBandwidthChartData.out,
          borderColor: gradientOut,
          backgroundColor: gradientOut,
          pointRadius: 2,
          cubicInterpolationMode: 'monotone'
        }
      ]
    }
  }

  if (nodeBandwidthChartData.in.length === 0) {
    return null
  }

  const options = {
    ...defaultSettings,
    animation: {
      // Only animate the 500 points
      duration: nodeBandwidthChartData.in.length <= animatedPoints ? 1000 : 0
    }
  }

  return (
    <Box className={`pa4 pr2 ${className}`}>
      <Title>{t('bandwidthOverTime')}</Title>
      <Line data={data} options={options} />
    </Box>
  )
}

NodeBandwidthChart.propTypes = {
  nodeBandwidthChartData: PropTypes.object.isRequired,
  animatedPoints: PropTypes.number
}

NodeBandwidthChart.defaultProps = {
  animatedPoints: 500 // Only animate for the first 500 points
}

export default connect('selectNodeBandwidthChartData', translate('status')(NodeBandwidthChart))

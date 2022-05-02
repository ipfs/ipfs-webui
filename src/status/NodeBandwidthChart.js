/* eslint-disable space-before-function-paren */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Line, defaults } from 'react-chartjs-2'
import { withTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import filesize from 'filesize'
// import { Title } from './Commons'

import Point from '../icons/retro/Point'

defaults.global.defaultFontFamily = 'W95FA'
defaults.global.defaultFontColor = '#D3C85F'
defaults.global.defaultFontSize = 12

// matching units returned by 'ipfs stats bw' in CLI
const bwUnits = {
  standard: 'iec',
  base: 2,
  bits: false
}

const chartsize = filesize.partial({ round: 1, exponent: 2, ...bwUnits })
const tootltipSize = filesize.partial({ round: 0, output: 'array', ...bwUnits })

const getXLabel = v => {
  let timeParts = (v.split(' ')[0] + '').split(':')

  if (timeParts.length >= 3) {
    timeParts = timeParts.slice(0, timeParts.lenth)
    return timeParts + ' ' + v.split(' ')[1]
  }
  return timeParts + ' ' + v.split(' ')[1]
}

const defaultSettings = {
  defaultFontFamily: 'W95FA',
  responsive: true,
  tooltips: {
    mode: 'index',
    intersect: false,
    enabled: false
  },
  hover: { intersect: false, mode: 'index', animationDuration: 0 },
  scales: {
    xAxes: [{
      type: 'time',
      time: {
        minUnit: 'second'
      },
      display: true,
      gridLines: {
        display: false,
        color: '#555',
        borderDash: [10, 3]
      },
      ticks: {
        minor: {
          fontColor: '#59588D',
          callback: v => getXLabel(v)
        },
        maxTicksLimit: 5
      }
    }],
    yAxes: [{
      stacked: true,
      ticks: {
        callback: v => chartsize(v) + '/s',
        suggestedMax: 200000,
        maxTicksLimit: 5,
        fontColor: '#59588D'
      },
      gridLines: {
        display: false,
        color: '#555',
        zeroLineColor: '#209EEC',
        borderDash: [10, 3]
      }
    }]
  },
  legend: {
    display: false
  },
  animation: {
    duration: 0
  },
  responsiveAnimationDuration: 0
}

const Tooltip = ({ t, bw, show, pos }) => {
  if (!show) {
    return null
  }

  return (
    <div className='sans-serif absolute pa2' style={{
      top: `${pos.top + window.scrollY}px`,
      left: `${pos.left - 45}px`,
      transform: 'translateY(calc(-100% - 10px))',
      filter: 'drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.2))',
      width: '90px',
      background: '#FEF9CA'
    }}>
      <div className='absolute' style={{
        bottom: '-6px',
        left: '37px',
        width: '0',
        height: '0',
        borderTop: '7px solid #FEF9CA',
        borderRight: '8px solid transparent',
        borderLeft: '8px solid transparent'
      }} />
      <div className='flex-column items-center justify-center w95fa'>
        {bw.in && (
          <div className='dt-row'>
            <span className='dtc f6 tr'>{t('app:terms.in').toLowerCase()}:</span>
            <span className='f6 ml1'>{bw.in[0]}</span>
            <span className='f6'>{bw.in[1]}/s</span>
          </div>
        )}
        {bw.out && (
          <div className='dt-row'>
            <span className='dtc f6 tr'>{t('app:terms.out').toLowerCase()}:</span>
            <span className='f6 ml1'>{bw.out[0]}</span>
            <span className='f6'>{bw.out[1]}/s</span>
          </div>
        )}
      </div>
    </div>
  )
}

function NodeBandwidthChart(props) {
  const [legend, setLegend] = useState();
  const [ref, setRef] = useState();

  const onRefChange = useCallback(node => {
    setRef(node);
    if (node !== null) {
      setLegend(node.chartInstance.generateLegend())
    }
  }, []);

  const handleLegendClick = (event, datasetIndex, chartInstance) => {
    var meta = chartInstance.getDatasetMeta(datasetIndex);
    meta.hidden = meta.hidden === null ? !chartInstance.data.datasets[datasetIndex].hidden : null;

    event.target.classList.toggle('strike');

    chartInstance.update()
  }

  const tooltip = useRef(null)

  // generates tooltip data.
  const data = () => {
    const { t, nodeBandwidthChartData } = props

    return function () {
      return {
        datasets: [
          {
            label: t('app:terms.out'),
            data: nodeBandwidthChartData.out,
            borderColor: '#BDFF69',
            borderWidth: 1,
            pointBackgroundColor: '#BDFF69',
            pointRadius: 0,
            pointHoverRadius: 3,
            cubicInterpolationMode: 'default',
            tension: 0.1
          },
          {
            label: t('app:terms.in'),
            data: nodeBandwidthChartData.in,
            borderColor: '#FA5050',
            borderWidth: 1,
            pointBackgroundColor: '#FA5050',
            pointRadius: 0,
            pointHoverRadius: 3,
            cubicInterpolationMode: 'default',
            tension: 0.01
          }
        ]
      }
    }
  }

  useEffect(() => {
    const tooltipElement = document.createElement('div');
    tooltipElement.id = 'node_bw_chart'
    tooltipElement.style.pointerEvents = 'none';
    document.body.appendChild(tooltipElement)

    tooltip.current = tooltipElement
  }, [])

  useEffect(() => {
    if (tooltip.current) {
      ReactDOM.render(<Tooltip show={false} />, tooltip.current)
    }
  })

  const { t, nodeBandwidthChartData } = props

  if (nodeBandwidthChartData.in.length === 0) {
    return null
  }

  const options = {
    ...defaultSettings,
    legendCallback: (chartInstance) => {
      const datasets = chartInstance.data.datasets;

      return (
        <div className='chart-legend flex items-center mt1 mr4 w-100'>
          {datasets && datasets.map((dataset, index) => (
            <li
              key={index}
              id={dataset.borderColor}
              aria-hidden={true}
              className='flex mr3 w95fa white pointer'
              onClick={(event) => handleLegendClick(event, index, chartInstance)}>
              <Point style={{ pointerEvents: 'none', marginRight: '10px', marginTop: '5px' }} color={dataset.borderColor} />
              <div style={{ pointerEvents: 'none', fontSize: '14px' }}>{dataset.label}</div>
            </li>
          ))}
        </div>
      );
    },
    tooltips: {
      ...defaultSettings.tooltips,
      custom: function (model) {
        const data = { show: true }

        if (model.opacity === 0) {
          data.show = false
        } else {
          const dataOut = model.dataPoints.find(x => x.datasetIndex === 0);
          const dataIn = model.dataPoints.find(x => x.datasetIndex === 1);

          data.bw = {
            out: dataOut ? tootltipSize(Math.abs(dataOut.yLabel)) : undefined,
            in: dataIn ? tootltipSize(Math.abs(dataIn.yLabel)) : undefined
          }

          const rect = this._chart.canvas.getBoundingClientRect()
          data.pos = {
            left: rect.left + model.caretX,
            top: rect.top + model.dataPoints[model.dataPoints.length - 1].y
          }
        }

        // I know this isn't a very React-y way of doing this, but there was a simple issue:
        // re-rendering the tooltip was also re-rendering the chart which then lost its focus
        // state causing the Tooltip to stick and not disappear.
        ReactDOM.render(<Tooltip t={t} {...data} />, tooltip.current)
      }
    }
  }

  return (
    <div>
      <div className='flex items-start'>
        {/* <Title>{t('bandwidthOverTime')}</Title> */}
        {/* {legend} */}
      </div>
      <Line data={data()} options={options} ref={onRefChange} />
    </div>
  )
}

export default connect('selectNodeBandwidthChartData', withTranslation('status')(NodeBandwidthChart))

import { createSelector } from 'redux-bundler'
import simplify from 'simplify-js'

// Depends on nodeBandwidthBundle
export default function (opts) {
  opts = opts || {}
  // Only store up to 1 day of data
  opts.windowSize = opts.windowSize || 1000 * 60 * 60 * 24
  // Enable/disable simplify
  opts.simplify = opts.simplify == null ? true : opts.simplify
  // Simplify 5KB variations away
  opts.simplifyTolerance = opts.simplifyTolerance == null
    ? 5000
    : opts.simplifyTolerance

  return {
    name: 'nodeBandwidthChart',

    reducer (state = { data: [] }, action) {
      if (action.type === 'NODE_BANDWIDTH_CHART_DATA_UPDATED') {
        return { ...state, data: action.payload.chartData }
      }

      return state
    },

    selectNodeBandwidthChartData: state => state.nodeBandwidthChart.data,

    doUpdateNodeBandwidthChartData: (bw, timestamp, chartData) => ({ dispatch }) => {
      const total = parseInt(bw.rateIn.add(bw.rateOut).toFixed(0), 10)

      chartData = chartData.concat({ x: timestamp, y: total })

      const startIndex = chartData.findIndex(d => d.x >= timestamp - opts.windowSize)
      if (startIndex > 0) chartData = chartData.slice(startIndex)

      if (opts.simplify) {
        chartData = simplify(chartData, opts.simplifyTolerance, true)
      }

      dispatch({ type: 'NODE_BANDWIDTH_CHART_DATA_UPDATED', payload: { chartData } })
    },

    reactUpdateNodeBandwidthChartData: createSelector(
      'selectNodeBandwidthRaw',
      'selectNodeBandwidthChartData',
      (bwRaw, chartData) => {
        if (!bwRaw.data) return

        if (!chartData.length || bwRaw.lastSuccess > chartData[chartData.length - 1].x) {
          return {
            actionCreator: 'doUpdateNodeBandwidthChartData',
            args: [bwRaw.data, bwRaw.lastSuccess, chartData]
          }
        }
      }
    )
  }
}

import { createSelector } from 'redux-bundler'
import simplify from 'simplify-js'

// Depends on nodeBandwidthBundle
export default function (opts) {
  opts = opts || {}
  // Only store up to 1 day of data
  opts.windowSize = opts.windowSize || 1000 * 60 * 60 * 24
  // Enable/disable simplify
  opts.simplify = opts.simplify == null ? true : opts.simplify
  // Simplify 1KB variations away
  opts.simplifyTolerance = opts.simplifyTolerance == null
    ? 1000
    : opts.simplifyTolerance

  return {
    name: 'nodeBandwidthChart',

    reducer (state = { data: { in: [], out: [] } }, action) {
      if (action.type === 'NODE_BANDWIDTH_CHART_DATA_UPDATED') {
        return { ...state, data: action.payload.chartData }
      }

      return state
    },

    selectNodeBandwidthChartData: state => state.nodeBandwidthChart.data,

    doUpdateNodeBandwidthChartData: (bw, timestamp, chartData) => ({ dispatch }) => {
      chartData = {
        in: chartData.in.concat({ x: timestamp, y: parseInt(bw.rateIn.toFixed(0), 10) }),
        out: chartData.out.concat({ x: timestamp, y: parseInt(bw.rateOut.toFixed(0), 10) })
      }

      console.log(bw)

      const startIndex = chartData.in.findIndex(d => d.x >= timestamp - opts.windowSize)
      if (startIndex > 0) {
        chartData.in = chartData.in.slice(startIndex)
        chartData.out = chartData.out.slice(startIndex)
      }

   

      console.log(chartData)
      dispatch({ type: 'NODE_BANDWIDTH_CHART_DATA_UPDATED', payload: { chartData } })
    },

    reactUpdateNodeBandwidthChartData: createSelector(
      'selectNodeBandwidthRaw',
      'selectNodeBandwidthChartData',
      (bwRaw, chartData) => {
        if (!bwRaw.data) return

        // Only tests for .in because it has the same timestamps as .out
        if (!chartData.in.length || bwRaw.lastSuccess > chartData.in[chartData.in.length - 1].x) {
          return {
            actionCreator: 'doUpdateNodeBandwidthChartData',
            args: [bwRaw.data, bwRaw.lastSuccess, chartData]
          }
        }
      }
    )
  }
}

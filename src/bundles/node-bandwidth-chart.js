import { createSelector } from 'redux-bundler'

// Depends on nodeBandwidthBundle
function createNodeBandwidthChart (opts) {
  opts = opts || {}
  // Only store up to 1 day of data
  opts.windowSize = opts.windowSize || 1000 * 60 * 60 * 24

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
        out: chartData.out.concat({ x: timestamp, y: parseInt(bw.rateOut.toFixed(0) * -1, 10) })
      }

      const startIndex = chartData.in.findIndex(d => d.x >= timestamp - opts.windowSize)
      if (startIndex > 0) {
        chartData.in = chartData.in.slice(startIndex)
        chartData.out = chartData.out.slice(startIndex)
      }

      dispatch({ type: 'NODE_BANDWIDTH_CHART_DATA_UPDATED', payload: { chartData } })
    },

    reactUpdateNodeBandwidthChartData: createSelector(
      'selectNodeBandwidth',
      'selectNodeBandwidthLastSuccess',
      'selectNodeBandwidthEnabled',
      'selectNodeBandwidthChartData',
      (bw, lastSuccess, enabled, chartData) => {
        if (!bw || !enabled) return

        // Only tests for .in because it has the same timestamps as .out
        if (!chartData.in.length || lastSuccess > chartData.in[chartData.in.length - 1].x) {
          return {
            actionCreator: 'doUpdateNodeBandwidthChartData',
            args: [bw, lastSuccess, chartData]
          }
        }
      }
    )
  }
}
export default createNodeBandwidthChart

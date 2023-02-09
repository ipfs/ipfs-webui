/* global it, expect */
import { composeBundlesRaw, createReactorBundle } from 'redux-bundler'
import createNodeBandwidthChartBundle from './node-bandwidth-chart.js'
import { randomInt } from '../../test/helpers/random.js'
import sleep from '../../test/helpers/sleep.js'
import { fakeBandwidth } from '../../test/helpers/bandwidth.js'

const mockNodeBandwidthBundle = {
  name: 'nodeBandwidth',
  reducer (state = { data: null }, action) {
    return action.type === 'UPDATE_MOCK_NODE_BANDWIDTH' ? action.payload : state
  },
  selectNodeBandwidth: state => state.nodeBandwidth.data,
  selectNodeBandwidthLastSuccess: state => state.nodeBandwidth.lastSuccess,
  selectNodeBandwidthEnabled: () => true,
  selectNodeBandwidthRaw: state => state.nodeBandwidth
}

it('should accumulate bandwidth changes', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    mockNodeBandwidthBundle,
    createNodeBandwidthChartBundle()
  )()

  let chartData = store.selectNodeBandwidthChartData()
  expect(chartData).toEqual({ in: [], out: [] })

  const bandwidths = []

  for (let i = 0, total = randomInt(1, 10); i < total; i++) {
    const bwRaw = { data: fakeBandwidth(), lastSuccess: Date.now() }
    bandwidths.push(bwRaw)
    store.dispatch({ type: 'UPDATE_MOCK_NODE_BANDWIDTH', payload: bwRaw })
    await sleep()
  }

  chartData = store.selectNodeBandwidthChartData()
  expect(chartData.in.length).toEqual(bandwidths.length)
  expect(chartData.out.length).toEqual(bandwidths.length)
})

it('should simplify data points within tolerance', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    mockNodeBandwidthBundle,
    createNodeBandwidthChartBundle()
  )()

  let chartData = store.selectNodeBandwidthChartData()
  expect(chartData).toEqual({ in: [], out: [] })

  const bw = fakeBandwidth()

  store.dispatch({
    type: 'UPDATE_MOCK_NODE_BANDWIDTH',
    payload: { data: bw, lastSuccess: Date.now() }
  })
  await sleep()

  store.dispatch({
    type: 'UPDATE_MOCK_NODE_BANDWIDTH',
    payload: { data: bw, lastSuccess: Date.now() }
  })
  await sleep()

  store.dispatch({
    type: 'UPDATE_MOCK_NODE_BANDWIDTH',
    payload: { data: bw, lastSuccess: Date.now() }
  })
  await sleep()

  chartData = store.selectNodeBandwidthChartData()
  expect(chartData.in.length).toEqual(3)
  expect(chartData.out.length).toEqual(3)
})

it('should truncate data outside of window size', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    mockNodeBandwidthBundle,
    createNodeBandwidthChartBundle({
      windowSize: 100
    })
  )()

  let chartData = store.selectNodeBandwidthChartData()
  expect(chartData).toEqual({ in: [], out: [] })

  for (let i = 0, total = randomInt(1, 5); i < total; i++) {
    const bwRaw = { data: fakeBandwidth(), lastSuccess: Date.now() }
    store.dispatch({ type: 'UPDATE_MOCK_NODE_BANDWIDTH', payload: bwRaw })
    await sleep(10)
  }

  // Wait until after the windowSize
  await sleep(200)

  store.dispatch({
    type: 'UPDATE_MOCK_NODE_BANDWIDTH',
    payload: { data: fakeBandwidth(), lastSuccess: Date.now() }
  })

  await sleep(10)

  chartData = store.selectNodeBandwidthChartData()
  expect(chartData.in.length).toEqual(1)
  expect(chartData.out.length).toEqual(1)
})

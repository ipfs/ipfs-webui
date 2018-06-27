/* global it, expect */
import { composeBundlesRaw, createReactorBundle } from 'redux-bundler'
import createNodeBandwidthChartBundle from './node-bandwidth-chart'
import { randomInt } from '../../test/helpers/random'
import sleep from '../../test/helpers/sleep'
import { fakeBandwidth } from '../../test/helpers/bandwidth'

const mockNodeBandwidthBundle = {
  name: 'nodeBandwidth',
  reducer (state = { data: null }, action) {
    return action.type === 'UPDATE_MOCK_NODE_BANDWIDTH' ? action.payload : state
  },
  selectNodeBandwidthRaw: state => state.nodeBandwidth
}

it('should accumulate bandwidth changes', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    mockNodeBandwidthBundle,
    // Ensure none of our data gets simplified away
    createNodeBandwidthChartBundle({ simplify: false })
  )()

  let chartData = store.selectNodeBandwidthChartData()
  expect(chartData).toEqual([])

  const bandwidths = []

  for (let i = 0, total = randomInt(1, 10); i < total; i++) {
    const bwRaw = { data: fakeBandwidth(), lastSuccess: Date.now() }
    bandwidths.push(bwRaw)
    store.dispatch({ type: 'UPDATE_MOCK_NODE_BANDWIDTH', payload: bwRaw })
    await sleep()
  }

  chartData = store.selectNodeBandwidthChartData()
  expect(chartData.length).toEqual(bandwidths.length)
})

it('should simplify data points within tolerance', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    mockNodeBandwidthBundle,
    createNodeBandwidthChartBundle()
  )()

  let chartData = store.selectNodeBandwidthChartData()
  expect(chartData).toEqual([])

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
  expect(chartData.length).toEqual(2) // should have simplified third
})

it('should truncate data outside of window size', async () => {
  const store = composeBundlesRaw(
    createReactorBundle(),
    mockNodeBandwidthBundle,
    createNodeBandwidthChartBundle({
      // Ensure none of our data gets simplified away
      simplify: false,
      windowSize: 100
    })
  )()

  let chartData = store.selectNodeBandwidthChartData()
  expect(chartData).toEqual([])

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
  expect(chartData.length).toEqual(1)
})

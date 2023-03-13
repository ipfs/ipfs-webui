import React from 'react'
import NetworkTrafficComponent from './NetworkTraffic.js'
import { Provider } from 'redux-bundler-react'
import { composeBundlesRaw } from 'redux-bundler'

const getStore = composeBundlesRaw({
  name: 'nodeBandwidth',
  selectNodeBandwidth: state => state.nodeBandwidth,
  reducer: (state, { type, payload }) => {
    if (type === 'NODE_BANDWIDTH_UPDATED') {
      return payload
    }
    return state ?? { rateIn: 0, rateOut: 0 }
  }
})

const store = getStore({ nodeBandwidth: { rateIn: 0, rateOut: 0 } })

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const maxBandwidth = 125000

let interval = null
const setRandomUpdateInterval = (intervalSections = 1000) => {
  if (interval) {
    clearInterval(interval)
  }
  if (intervalSections > 0) {
    interval = setInterval(() => {
      store.dispatch({ type: 'NODE_BANDWIDTH_UPDATED', payload: { rateIn: randomInt(0, maxBandwidth), rateOut: randomInt(0, maxBandwidth) } })
    }, intervalSections)
  }
}

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Status/NetworkTraffic',
  component: NetworkTrafficComponent,
  render: ({ updateSeconds, rateIn, rateOut }) => {
    console.log('updateSeconds: ', updateSeconds)
    setRandomUpdateInterval(updateSeconds * 1000)
    if (updateSeconds === 0) {
      store.dispatch({ type: 'NODE_BANDWIDTH_UPDATED', payload: { rateIn, rateOut } })
    }

    return (
      <Provider store={store}>
        <NetworkTrafficComponent />
      </Provider>
    )
  },
  argTypes: {
    updateSeconds: {
      control: {
        type: 'range',
        min: 0,
        max: 10,
        step: 0.25
      }
    },
    rateIn: {
      control: {
        type: 'range',
        min: 0,
        max: maxBandwidth,
        step: 1000
      }
    },
    rateOut: {
      control: {
        type: 'range',
        min: 0,
        max: maxBandwidth,
        step: 1000
      }
    }
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const NetworkTraffic = {
  args: {
    updateSeconds: 1,
    rateIn: 0,
    rateOut: 0
  }
}

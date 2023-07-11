import React from 'react'
import PeerBandwidthTableComponent from './PeerBandwidthTable.js'
import { Provider } from 'redux-bundler-react'
import { composeBundlesRaw } from 'redux-bundler'

const defaultState = {
  peerBandwidthPeers: [
    {
      id: 'peer1',
      bw: {
        rateIn: 1000,
        rateOut: 500,
        totalIn: 10000,
        totalOut: 5000
      }
    },
    {
      id: 'peer2',
      bw: {
        rateIn: 10,
        rateOut: 5,
        totalIn: 10000,
        totalOut: 5000
      }
    }
  ],
  peerLocations: {
    peer1: {
      country_name: 'United States',
      country_code: 'US'
    },
    peer2: {
      country_name: 'Canada',
      country_code: 'CA'
    }
  }
}

const getStore = composeBundlesRaw({
  name: 'peerBandwidth',
  selectPeerBandwidthPeers: state => state.peerBandwidth.peerBandwidthPeers,
  selectPeerLocations: state => state.peerBandwidth.peerLocations,
  reducer: (state, { type, payload }) => state ?? defaultState
})
const store = getStore({ peerBandwidth: defaultState })

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Status/PeerBandwidthTable',
  component: PeerBandwidthTableComponent,
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story/>
      </Provider>
    )
  ]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const PeerBandwidthTable = {
  args: {
    peerBandwidthPeers: defaultState.peerBandwidthPeers,
    peerLocations: defaultState.peerLocations
  }
}

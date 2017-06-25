/* eslint-env mocha */

import {expect} from 'chai'

import reducer from '../../src/app/js/reducers/config'
import {config as actions} from '../../src/app/js/actions'

describe('reducers - config', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, {}))
      .to.eql({config: {}})
  })

  it('sets config', () => {
    const response = {
      Addresses: {
        API: '/ip4/127.0.0.1/tcp/5001',
        Gateway: '/ip4/127.0.0.1/tcp/8080',
        Swarm: [
          '/ip4/0.0.0.0/tcp/4001',
          '/ip6/::/tcp/4001'
        ]
      }
    }

    expect(reducer({config: {}}, actions.config.load.success(response)))
      .to.have.property('config').eql(response)
  })
})

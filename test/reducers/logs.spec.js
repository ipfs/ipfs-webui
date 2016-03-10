import {expect} from 'chai'
import {range, last} from 'lodash'

import reducer from '../../app/scripts/reducers/logs'
import {logs as actions} from '../../app/scripts/actions'

describe('reducers - logs', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, {})
    ).to.have.all.keys([
      'list',
      'systems',
      'selectedSystem',
      'tail'
    ])
  })

  it('handles response', () => {
    expect(
      reducer({list: [1]}, actions.logs.receive({hello: 'world'}))
    ).to.have.property('list').eql([1, {hello: 'world'}])
  })

  it('only keeps 500 entries', () => {
    const state = reducer({list: range(500)}, actions.logs.receive(-1))
    const state2 = reducer(state, actions.logs.receive(-2))
    expect(state.list).to.have.length(500)
    expect(state2.list).to.have.length(500)
    expect(last(state.list)).to.be.eql(-1)
    expect(last(state2.list)).to.be.eql(-2)
  })
})

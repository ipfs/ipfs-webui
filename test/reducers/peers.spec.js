import {expect} from 'chai'

import reducer from '../../app/scripts/reducers/peers'
import {peers as actions} from '../../app/scripts/actions'

describe('reducers - peers', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, {})
    ).to.be.eql({ids: [], details: {}, locations: {}})
  })

  it('handles peerIds response', () => {
    expect(
      reducer({
        ids: [{id: 2}],
        details: {}
      }, actions.peerIds.success([{id: 1}]))
    ).to.be.eql({
      ids: [{id: 1}],
      details: {}
    })
  })

  it('handles peerDetails response', () => {
    expect(
      reducer({
        ids: [{id: 1}],
        details: {}
      }, actions.peerDetails.success({1: {}}))
    ).to.be.eql({
      ids: [{id: 1}],
      details: {1: {}}
    })
  })

  it('handles peerLocations response', () => {
    expect(
      reducer({
        ids: [{id: 1}],
        details: {},
        locations: {}
      }, actions.peerLocations.success({1: {}}))
    ).to.be.eql({
      ids: [{id: 1}],
      details: {},
      locations: {1: {}}
    })
  })
})

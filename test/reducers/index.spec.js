import {expect} from 'chai'
import {range, last} from 'lodash'

import * as reducers from '../../app/scripts/reducers'
import * as actions from '../../app/scripts/actions'

describe('reducers', () => {
  describe('id', () => {
    it('returns the initial state', () => {
      expect(
        reducers.id(undefined, {})
      ).to.be.eql({})
    })

    it('handles response', () => {
      expect(
        reducers.id({}, actions.home.id.success({node: 1}))
      ).to.be.eql({node: 1})
    })
  })

  describe('peers', () => {
    it('returns the initial state', () => {
      expect(
        reducers.peers(undefined, {})
      ).to.be.eql({ids: [], details: {}, locations: {}})
    })

    it('handles peerIds response', () => {
      expect(
        reducers.peers({
          ids: [{id: 2}],
          details: {}
        }, actions.peers.peerIds.success([{id: 1}]))
      ).to.be.eql({
        ids: [{id: 1}],
        details: {}
      })
    })

    it('handles peerDetails response', () => {
      expect(
        reducers.peers({
          ids: [{id: 1}],
          details: {}
        }, actions.peers.peerDetails.success({1: {}}))
      ).to.be.eql({
        ids: [{id: 1}],
        details: {1: {}}
      })
    })

    it('handles peerLocations response', () => {
      expect(
        reducers.peers({
          ids: [{id: 1}],
          details: {},
          locations: {}
        }, actions.peers.peerLocations.success({1: {}}))
      ).to.be.eql({
        ids: [{id: 1}],
        details: {},
        locations: {1: {}}
      })
    })
  })

  describe('logs', () => {
    it('returns the initial state', () => {
      expect(
        reducers.logs(undefined, {})
      ).to.have.all.keys([
        'list',
        'systems',
        'selectedSystem',
        'tail'
      ])
    })

    it('handles response', () => {
      expect(
        reducers.logs({list: [1]}, actions.logs.logs.receive({hello: 'world'}))
      ).to.have.property('list').eql([1, {hello: 'world'}])
    })

    it('only keeps 500 entries', () => {
      const state = reducers.logs({list: range(500)}, actions.logs.logs.receive(-1))
      const state2 = reducers.logs(state, actions.logs.logs.receive(-2))
      expect(state.list).to.have.length(500)
      expect(state2.list).to.have.length(500)
      expect(last(state.list)).to.be.eql(-1)
      expect(last(state2.list)).to.be.eql(-2)
    })
  })

  describe('errorMessage', () => {
    it('returns the initial state', () => {
      expect(
        reducers.errorMessage(undefined, {})
      ).to.be.eql(null)
    })

    it('resets error message', () => {
      expect(
        reducers.errorMessage({
          error: ':('
        }, {
          type: actions.errors.RESET_ERROR_MESSAGE
        })
      ).to.be.eql(null)
    })

    it('sets errors', () => {
      expect(
        reducers.errorMessage({}, {
          error: ':('
        })
      ).to.be.eql(':(')
    })
  })

  describe('router', () => {
    it('returns the initial state', () => {
      expect(
        reducers.router(undefined, {})
      ).to.be.eql({pathname: '/'})
    })

    it('handles route updates', () => {
      expect(
        reducers.router({}, actions.router.updateRouterState({
          pathname: '/hello'
        }))
      ).to.be.eql({pathname: '/hello'})
    })
  })
})

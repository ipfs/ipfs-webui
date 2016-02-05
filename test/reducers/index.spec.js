import {expect} from 'chai'

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
        reducers.id({}, actions.id.success({node: 1}))
      ).to.be.eql({node: 1})
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
          type: actions.RESET_ERROR_MESSAGE
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
        reducers.router({}, actions.updateRouterState({
          pathname: '/hello'
        }))
      ).to.be.eql({pathname: '/hello'})
    })
  })
})

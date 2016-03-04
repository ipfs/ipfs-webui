import {expect} from 'chai'

import reducer from '../../app/scripts/reducers/router'
import {router as actions} from '../../app/scripts/actions'

describe('reducers - router', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, {})
    ).to.be.eql({pathname: '/'})
  })

  it('handles route updates', () => {
    expect(
      reducer({}, actions.updateRouterState({
        pathname: '/hello'
      }))
    ).to.be.eql({pathname: '/hello'})
  })
})

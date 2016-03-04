import {expect} from 'chai'

import reducer from '../../app/scripts/reducers/id'
import {home as actions} from '../../app/scripts/actions'

describe('reducers - id', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, {})
    ).to.be.eql({})
  })

  it('handles response', () => {
    expect(
      reducer({}, actions.id.success({node: 1}))
    ).to.be.eql({node: 1})
  })
})

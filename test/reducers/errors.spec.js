import {expect} from 'chai'

import reducer from '../../app/scripts/reducers/errors'
import {errors as actions} from '../../app/scripts/actions'

describe('reducers - errors ', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, {})
    ).to.be.eql(null)
  })

  it('resets error message', () => {
    expect(
      reducer({
        error: ':('
      }, {
        type: actions.RESET_ERROR_MESSAGE
      })
    ).to.be.eql(null)
  })

  it('sets errors', () => {
    expect(
      reducer({}, {
        error: ':('
      })
    ).to.be.eql(':(')
  })
})

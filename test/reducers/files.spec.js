import {expect} from 'chai'

import reducer from '../../app/scripts/reducers/files'
// import {files as actions} from '../../app/scripts/actions'

describe('reducers - files', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, {})
    ).to.be.eql({
      list: [],
      root: '/',
      tmpDir: null
    })
  })
})

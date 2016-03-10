import {expect} from 'chai'

import reducer from '../../app/scripts/reducers/files'
import {files as actions} from '../../app/scripts/actions'

describe('reducers - files', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, {})
    ).to.be.eql({
      list: [],
      root: '/',
      tmpDir: null,
      selected: [],
      preview: null
    })
  })

  it('selects a file', () => {
    expect(
      reducer(undefined, actions.filesSelect('/file'))
    ).to.have.property('selected').eql(['/file'])
  })

  it('selects a file (preexisting)', () => {
    expect(
      reducer({
        selected: ['/hello']
      }, actions.filesSelect('/file'))
    ).to.have.property('selected').eql([
      '/hello',
      '/file'
    ])
  })

  it('deselects a file (preexisting)', () => {
    expect(
      reducer({
        selected: ['/hello']
      }, actions.filesDeselect('/hello'))
    ).to.have.property('selected').eql([])
  })

  it('deselects all', () => {
    expect(
      reducer({
        selected: ['/hello', '/world']
      }, actions.filesDeselectAll())
    ).to.have.property('selected').eql([])
  })
})

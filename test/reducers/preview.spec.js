import {expect} from 'chai'

import reducer from '../../app/scripts/reducers/preview'
import {preview as actions} from '../../app/scripts/actions'

describe('reducers - preview', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, {})
    ).to.be.eql({
      name: '',
      content: null,
      type: '',
      stats: {}
    })
  })

  it('sets name and stats', () => {
    const response = {name: '/test/file.jpg', stats: {Hash: 'TEST', Size: 34891, Type: 'file'}}

    expect(
      reducer({name: '', stats: {}}, actions.requests.stat.success(response))
    ).to.have.property('name').eql(response.name)

    expect(
      reducer({name: '', stats: {}}, actions.requests.stat.success(response))
    ).to.have.property('stats').eql(response.stats)
  })

  it('sets content', () => {
    expect(
      reducer({content: null}, actions.requests.read.success('# Hello World'))
    ).to.have.property('content').eql('# Hello World')
  })

  it('clears preview', () => {
    expect(
      reducer({content: null}, actions.clear())
    ).to.eql({
      name: '',
      content: null,
      type: '',
      stats: {}
    })
  })
})

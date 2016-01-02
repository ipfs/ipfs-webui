import {expect} from 'chai'
import {parse} from '../../app/scripts/utils/path'

describe('path.parse', () => {
  it('works', () => {
    expect(parse('/ipfs/localhost/hello')).to.have.property('protocol', 'ipfs')
  })
})

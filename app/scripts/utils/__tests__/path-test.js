/* eslint-env mocha */

import {expect} from 'chai'
import {parse} from '../path'

describe('path.parse', () => {
  it('works', () => {
    expect(parse('/ipfs/localhost/hello')).to.have.property('protocol', 'ipfs')
  })
})

/* eslint-env mocha */

import {expect} from 'chai'
import path from '../path'

describe('path.parse', () => {
  it('works', () => {
    expect(path.parse('/ipfs/localhost/hello')).to.have.property('protocol', 'ipfs')
  })
})

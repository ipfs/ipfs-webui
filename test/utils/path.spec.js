/* eslint-env mocha */

import {expect} from 'chai'
import Path, {parse} from '../../src/js/utils/path'

describe('Path', () => {
  it('constructor', () => {
    const p = new Path('protocol', 'name', '/path')
    expect(p).to.have.property('protocol', 'protocol')
    expect(p).to.have.property('name', 'name')
    expect(p).to.have.property('path', '/path')
  })

  describe('parent', () => {
    it('returns null if no parent exist', () => {
      expect(new Path('http', 'hi', '').parent()).to.be.eql(null)
    })

    it('returns the parent path if it exists', () => {
      const parent = new Path('http', 'hi', '/world/hello').parent()
      expect(parent).to.have.property('path', '/world')
    })
  })

  describe('append', () => {
    it('appends a new path fragment', () => {
      const p = new Path('http', 'hi', '/world/hello')
      expect(p.append('some')).to.have.property('path', '/world/hello/some')
    })
  })

  describe('toString', () => {
    it('returns a string representation', () => {
      expect(new Path('http', 'hi', '/world/hello').toString()).to.be.eql('/http/hi/world/hello')
    })
  })

  describe('urlify', () => {
    it('returns an escaped version of toString', () => {
      const p = new Path('http', 'hi', '/world/hello')
      expect(p.urlify()).to.be.eql('/http/hi/world/hello')
    })
  })

  describe('parse', () => {
    it('works', () => {
      expect(parse('/ipfs/localhost/hello')).to.be.an.instanceOf(Path)
    })
  })
})

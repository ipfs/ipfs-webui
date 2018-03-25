/* eslint-env mocha */

import {expect} from 'chai'

import reducer from '../../src/js/reducers/files'
import {files as actions} from '../../src/js/actions'

describe('reducers - files', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, {})
    ).to.be.eql({
      list: [],
      root: '/',
      tmpDir: null,
      selected: []
    })
  })

  it('sets files list', () => {
    const response = [{ Name: 'test.js', Hash: 'TEST' }]
    expect(
      reducer({list: []}, actions.filesList.success(response))
    ).to.have.property('list').eql(response)
  })

  it('sets root', () => {
    expect(
      reducer({root: '/'}, actions.filesSetRoot('/test'))
    ).to.have.property('root').eql('/test')
  })

  it('creates a temporary directory', () => {
    expect(
      reducer({tmpDir: null}, actions.filesCreateTmpDir('/test'))
    ).to.have.property('tmpDir').eql({root: '/test', name: ''})
  })

  it('removes a temporary directory', () => {
    expect(
      reducer({tmpDir: {root: '/test', name: 'Hello'}}, actions.filesRmTmpDir())
    ).to.have.property('tmpDir').eql(null)
  })

  it('sets temporary directory name', () => {
    expect(
      reducer({tmpDir: {root: '/test', name: 'Hello'}}, actions.filesSetTmpDirName('World'))
    ).to.have.property('tmpDir').eql({root: '/test', name: 'World'})
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

  it('should not duplicate a selected file', () => {
    expect(
      reducer({
        selected: ['/file']
      }, actions.filesSelect('/file'))
    ).to.have.property('selected').eql(['/file'])
  })

  it('deselects a file (preexisting)', () => {
    expect(
      reducer({
        selected: ['/hello', '/world']
      }, actions.filesDeselect('/hello'))
    ).to.have.property('selected').eql(['/world'])
  })

  it('deselects all', () => {
    expect(
      reducer({
        selected: ['/hello', '/world']
      }, actions.filesDeselectAll())
    ).to.have.property('selected').eql([])
  })
})

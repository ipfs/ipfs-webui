/* eslint-env mocha */

import {expect} from 'chai'
import {put, call, select} from 'redux-saga/effects'

import {api} from '../../../src/js/services'
import {fetchFiles} from '../../../src/js/sagas/pages/files'
import {files as actions} from '../../../src/js/actions'

describe('sagas - pages - files', () => {
  it('fetchFiles success', () => {
    const generator = fetchFiles()

    expect(
      generator.next().value
    ).to.eql(
      put(actions.filesList.request())
    )

    expect(
      generator.next().value
    ).to.eql(
      select()
    )

    const state = {files: {root: '/'}}

    expect(
      generator.next(state).value
    ).to.eql(
      call(api.files.list, state.files.root)
    )

    const response = [{ Name: 'test.js', Hash: 'TEST' }]

    expect(
      generator.next(response).value
    ).to.eql(
      put(actions.filesList.success(response))
    )
  })

  it('fetchFiles failure', () => {
    const generator = fetchFiles()

    expect(
      generator.next().value
    ).to.eql(
      put(actions.filesList.request())
    )

    expect(
      generator.next().value
    ).to.eql(
      select()
    )

    const state = {files: {root: '/'}}

    expect(
      generator.next(state).value
    ).to.eql(
      call(api.files.list, state.files.root)
    )

    const err = new Error('Failed to fetch files')

    expect(
      generator.throw(err).value
    ).to.eql(
      put(actions.filesList.failure(err.message))
    )
  })
})

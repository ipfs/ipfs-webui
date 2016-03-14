import {expect} from 'chai'
import {put, call} from 'redux-saga/effects'

import {api} from '../../../app/scripts/services'
import {fetchId, load} from '../../../app/scripts/sagas/pages/home'
import {home as actions} from '../../../app/scripts/actions'

describe('sagas - pages - home', () => {
  describe('fetchId', () => {
    it('success', () => {
      const generator = fetchId()

      expect(
        generator.next().value
      ).to.be.eql(
        put(actions.id.request())
      )

      expect(
        generator.next().value
      ).to.be.eql(
        call(api.id)
      )

      expect(
        generator.next('hello').value
      ).to.be.eql(
        put(actions.id.success('hello'))
      )
    })

    it('failure', () => {
      const generator = fetchId()

      expect(
        generator.next().value
      ).to.be.eql(
        put(actions.id.request())
      )

      expect(
        generator.next().value
      ).to.be.eql(
        call(api.id)
      )

      expect(
        generator.throw(new Error('error')).value
      ).to.be.eql(
        put(actions.id.failure('error'))
      )
    })
  })

  it('load', () => {
    const generator = load()

    expect(
      generator.next().value
    ).to.be.eql(
      call(fetchId)
    )
  })
})

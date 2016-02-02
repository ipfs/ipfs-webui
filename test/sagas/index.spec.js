import {expect} from 'chai'
import {put, take, fork, call} from 'redux-saga'

import * as actions from '../../app/scripts/actions'
import {fetchId, loadId, watchLoadHomePage, watchNavigate} from '../../app/scripts/sagas'
import {api, history} from '../../app/scripts/services'

const id = {}
const state = {id}
const getState = () => state

describe('sagas', () => {
  describe('fetchId', () => {
    it('success', () => {
      const generator = fetchId(getState)

      let next = generator.next()
      expect(next.value).to.be.eql(put(actions.id.request()))

      next = generator.next()
      expect(next.value).to.be.eql(call(api.fetchId))

      next = generator.next(actions.id.success('hello'))
      expect(next.value).to.be.eql(put(actions.id.success('hello')))
    })

    it('failure', () => {
      const generator = fetchId(getState)

      let next = generator.next()
      expect(next.value).to.be.eql(put(actions.id.request()))

      next = generator.next()
      expect(next.value).to.be.eql(call(api.fetchId))

      next = generator.next(actions.id.failure('error'))
      expect(next.value).to.be.eql(put(actions.id.failure('error')))
    })
  })

  it('loadId', () => {
    const generator = loadId(getState)

    let next = generator.next()
    expect(next.value).to.be.eql(call(fetchId))
  })

  it('watchLoadHomePage', () => {
    const generator = watchLoadHomePage(getState)

    let next = generator.next()
    expect(next.value).to.be.eql(take(actions.LOAD_HOME_PAGE))

    next = generator.next()
    expect(next.value).to.be.eql(fork(loadId))
  })

  it('watchNavigate', () => {
    const generator = watchNavigate(getState)

    let next = generator.next()
    expect(next.value).to.be.eql(take(actions.NAVIGATE))

    next = generator.next({pathname: '/hello'})
    expect(next.value).to.be.eql(history.push('/hello'))
  })
})

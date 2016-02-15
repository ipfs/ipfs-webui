import {expect} from 'chai'
import {put, take, fork, call, race} from 'redux-saga'

import * as actions from '../../app/scripts/actions'
import {
  fetchId,
  loadId,
  watchLogs,
  watchLoadHomePage,
  watchLoadLogsPage,
  watchNavigate
} from '../../app/scripts/sagas'
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
      expect(next.value).to.be.eql(call(api.id))

      next = generator.next('hello')
      expect(next.value).to.be.eql(put(actions.id.success('hello')))
    })

    it('failure', () => {
      const generator = fetchId(getState)

      let next = generator.next()
      expect(next.value).to.be.eql(put(actions.id.request()))

      next = generator.next()
      expect(next.value).to.be.eql(call(api.id))

      next = generator.throw(new Error('error'))
      expect(next.value).to.be.eql(put(actions.id.failure('error')))
    })
  })

  it('loadId', () => {
    const generator = loadId(getState)

    let next = generator.next()
    expect(next.value).to.be.eql(call(fetchId))
  })

  it('watchLogs', () => {
    const source = {
      getNext () {
        return 1
      }
    }
    const generator = watchLogs(source)
    const racer = race({
      data: call(source.getNext),
      cancel: take(actions.LEAVE_LOGS_PAGE)
    })

    let next = generator.next()
    expect(next.value).to.be.eql(racer)

    next = generator.next({data: 'log'})
    expect(next.value).to.be.eql(put(actions.logs.receive('log')))

    next = generator.next()
    expect(next.value).to.be.eql(racer)

    next = generator.next({data: 'log2'})
    expect(next.value).to.be.eql(put(actions.logs.receive('log2')))

    next = generator.next()
    expect(next.value).to.be.eql(racer)

    next = generator.next({cancel: true})
    expect(next.value).to.be.eql(put(actions.logs.cancel()))
  })

  it('watchLoadHomePage', () => {
    const generator = watchLoadHomePage(getState)

    let next = generator.next()
    expect(next.value).to.be.eql(take(actions.LOAD_HOME_PAGE))

    next = generator.next()
    expect(next.value).to.be.eql(fork(loadId))
  })

  it('watchLoadLogsPage', () => {
    const generator = watchLoadLogsPage(getState)

    let next = generator.next()
    expect(next.value)
      .to.be.eql(take(actions.LOAD_LOGS_PAGE))

    next = generator.next('source')
    expect(next.value)
      .to.be.eql(call(api.createLogSource))

    next = generator.next('source')
    expect(next.value)
      .to.be.eql(fork(watchLogs, 'source'))
  })

  it('watchNavigate', () => {
    const generator = watchNavigate(getState)

    let next = generator.next()
    expect(next.value).to.be.eql(take(actions.NAVIGATE))

    next = generator.next({pathname: '/hello'})
    expect(next.value).to.be.eql(history.push('/hello'))
  })
})

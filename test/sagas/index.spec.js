import {expect} from 'chai'
import {put, take, fork, call} from 'redux-saga'

import * as actions from '../../app/scripts/actions'
import {
  fetchId,
  loadId,
  watchLogs,
  getLogs,
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

  it('getLogs', () => {
    const generator = getLogs(getState)

    let next = generator.next()
    expect(next.value).to.be.eql(call(api.createLogSource))

    next = generator.next('source')
    expect(next.value).to.be.eql(fork(watchLogs, 'source'))
  })

  it('loadId', () => {
    const generator = loadId(getState)

    let next = generator.next()
    expect(next.value).to.be.eql(call(fetchId))
  })

  it('watchLogs', () => {
    const source = {
      nextMessage () {
        return 1
      }
    }
    const generator = watchLogs(source)

    let next = generator.next()
    expect(next.value).to.be.eql(call(source.nextMessage))

    next = generator.next('log')
    expect(next.value).to.be.eql(put(actions.logs.receive('log')))

    next = generator.next()
    expect(next.value).to.be.eql(call(source.nextMessage))

    next = generator.next('log2')
    expect(next.value).to.be.eql(put(actions.logs.receive('log2')))
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
    expect(next.value).to.be.eql(take(actions.LOAD_LOGS_PAGE))

    next = generator.next()
    expect(next.value).to.be.eql(fork(getLogs))
  })

  it('watchNavigate', () => {
    const generator = watchNavigate(getState)

    let next = generator.next()
    expect(next.value).to.be.eql(take(actions.NAVIGATE))

    next = generator.next({pathname: '/hello'})
    expect(next.value).to.be.eql(history.push('/hello'))
  })
})

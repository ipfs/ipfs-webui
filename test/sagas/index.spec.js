import {expect} from 'chai'
import {put, take, fork, call, race, select} from 'redux-saga/effects'

import * as actions from '../../app/scripts/actions'
import {
  fetchId,
  loadId,
  fetchPeerIds,
  fetchPeerDetails,
  fetchPeerLocations,
  watchPeers,
  watchLogs,
  watchLoadHomePage,
  watchLoadLogsPage,
  watchSaveConfig,
  loadConfig,
  saveConfig
} from '../../app/scripts/sagas'
import {api} from '../../app/scripts/services'
import {delay} from '../../app/scripts/utils/promise'

describe.skip('sagas', () => {
  it('watchLogs', () => {
    const source = {
      getNext () {
        return 1
      }
    }
    const generator = watchLogs(source)
    const racer = race({
      data: call(source.getNext),
      cancel: take(actions.pages.LOGS.LEAVE)
    })

    let next = generator.next()
    expect(next.value).to.be.eql(racer)

    next = generator.next({data: 'log'})
    expect(next.value).to.be.eql(put(actions.logs.logs.receive('log')))

    next = generator.next()
    expect(next.value).to.be.eql(racer)

    next = generator.next({data: 'log2'})
    expect(next.value).to.be.eql(put(actions.logs.logs.receive('log2')))

    next = generator.next()
    expect(next.value).to.be.eql(racer)

    next = generator.next({cancel: true})
    expect(next.value).to.be.eql(put(actions.logs.logs.cancel()))
  })

  it('watchLoadHomePage', () => {
    const generator = watchLoadHomePage()

    let next = generator.next()
    expect(next.value).to.be.eql(take(actions.pages.HOME.LOAD))

    next = generator.next()
    expect(next.value).to.be.eql(fork(loadId))
  })

  it('watchLoadLogsPage', () => {
    const generator = watchLoadLogsPage()

    let next = generator.next()
    expect(next.value)
      .to.be.eql(take(actions.pages.LOGS.LOAD))

    next = generator.next('source')
    expect(next.value)
      .to.be.eql(call(api.createLogSource))

    next = generator.next('source')
    expect(next.value)
      .to.be.eql(fork(watchLogs, 'source'))
  })

  describe('config', () => {
    const configActions = actions.config

    it('should loadConfig', () => {
      const generator = loadConfig()
      const ipfsConfig = call(api.getConfig)
      expect(generator.next().value).to.deep.eql(ipfsConfig)

      expect(generator.next().value.PUT.type)
      .to.eql(configActions.CONFIG.INITIALIZE_CONFIG)

      expect(generator.next().value)
      .to.deep.eql(fork(watchSaveConfig))
    })

    it('should saveConfig', () => {
      const generator = saveConfig()

      expect(generator.next().value)
      .to.deep.equal(put(configActions.config.saving(true)))

      expect(generator.next().value)
      .to.deep.equal(select())

      const state = {
        config: {
          draft: '{ "draft": "draft" }'
        }
      }
      expect(generator.next(state).value)
      .to.deep.equal(call(api.saveConfig, state.config.draft))

      expect(generator.next().value)
      .to.deep
      .equal(put(configActions.config.save(JSON.parse(state.config.draft))))

      expect(generator.next().value)
      .to.deep.equal(put(configActions.config.markSaved(true)))

      expect(generator.next().value)
      .to.deep.equal(put(configActions.config.saving(false)))
    })
  })
})

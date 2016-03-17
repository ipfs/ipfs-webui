import {expect} from 'chai'
import {put, call, race, take, fork} from 'redux-saga/effects'

import {api} from '../../../app/scripts/services'
import {watchLogs, load} from '../../../app/scripts/sagas/pages/logs'
import {logs as actions, pages} from '../../../app/scripts/actions'

describe('sagas - pages -logs', () => {
  it('watchLogs', () => {
    const source = {
      getNext () {
        return 1
      }
    }
    const generator = watchLogs(source)
    const racer = race({
      data: call(source.getNext),
      cancel: take(pages.LOGS.LEAVE)
    })

    expect(
      generator.next().value
    ).to.be.eql(
      racer
    )

    expect(
      generator.next({data: 'log'}).value
    ).to.be.eql(
      put(actions.logs.receive('log'))
    )

    expect(
      generator.next().value
    ).to.be.eql(
      racer
    )

    expect(
      generator.next({data: 'log2'}).value
    ).to.be.eql(
      put(actions.logs.receive('log2'))
    )

    expect(
      generator.next().value
    ).to.be.eql(
      racer
    )

    expect(
      generator.next({cancel: true}).value
    ).to.be.eql(
      put(actions.logs.cancel())
    )
  })

  it('load', () => {
    const generator = load()

    expect(
      generator.next('source').value
    ).to.be.eql(
      call(api.createLogSource)
    )

    expect(
      generator.next('source').value
    ).to.be.eql(
      fork(watchLogs, 'source')
    )
  })
})

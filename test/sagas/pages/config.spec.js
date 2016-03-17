import {expect} from 'chai'
import {put, call, take, select} from 'redux-saga/effects'

import {api} from '../../../app/scripts/services'
import {initConfig, saveConfig} from '../../../app/scripts/sagas/pages/config'
import {config as actions} from '../../../app/scripts/actions'

describe('sagas - pages - config', () => {
  it('initConfig', () => {
    const generator = initConfig()

    expect(
      generator.next().value
    ).to.deep.eql(
      take(actions.CONFIG.LOAD.SUCCESS)
    )

    expect(
      generator.next({response: 'response'}).value
    ).to.eql(
      put(actions.config.initializeConfig('response'))
    )
  })

  it('saveConfig', () => {
    const generator = saveConfig()

    expect(generator.next().value)
      .to.deep.equal(put(actions.config.saving(true)))

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
      .equal(put(actions.config.save(JSON.parse(state.config.draft))))

    expect(generator.next().value)
      .to.deep.equal(put(actions.config.markSaved(true)))

    expect(generator.next().value)
      .to.deep.equal(put(actions.config.saving(false)))
  })
})

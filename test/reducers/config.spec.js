import {expect} from 'chai'

import reducer from '../../app/scripts/reducers/config'
import {config as actions} from '../../app/scripts/actions'

describe('Config Reducer', () => {
  it('should mark a config as saving', () => {
    expect(reducer({state: 'state'}, {
      type: actions.CONFIG.SAVING_CONFIG,
      saving: true
    }))
    .to.deep.equal({
      state: 'state',
      saving: true
    })
  })

  it('should save config', () => {
    expect(reducer({state: 'state'}, {
      type: actions.CONFIG.SAVE_CONFIG,
      config: 'foo'
    }))
    .to.deep.equal({
      state: 'state',
      config: 'foo'
    })
  })

  it('should initialize config', () => {
    const config = {config: 'config'}

    expect(reducer({state: 'state'}, {
      type: actions.CONFIG.INITIALIZE_CONFIG,
      config: config
    }))
    .to.deep.equal({
      state: 'state',
      config: {config: 'config'},
      draft: JSON.stringify(config, undefined, 2)
    })
  })

  it('should save config draft', () => {
    expect(reducer({state: 'state'}, {
      type: actions.CONFIG.SAVE_CONFIG_DRAFT,
      draft: 'draft'
    }))
    .to.deep.equal({
      state: 'state',
      draft: 'draft'
    })
  })

  it('should reset config draft', () => {
    const config = {config: 'config'}

    expect(reducer({state: 'state', config: config}, {
      type: actions.CONFIG.RESET_CONFIG_DRAFT
    }))
    .to.deep.equal({
      state: 'state',
      config: config,
      draft: JSON.stringify(config, undefined, 2)
    })
  })
})

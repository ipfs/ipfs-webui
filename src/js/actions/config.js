import {action, createRequestTypes} from './utils'

export const CONFIG = {
  INITIALIZE_CONFIG: 'INITIALIZE_CONFIG',
  SAVING_CONFIG: 'SAVING_CONFIG',
  SAVE_CONFIG: 'SAVE_CONFIG',
  SAVED_CONFIG: 'SAVED_CONFIG',
  SAVE_CONFIG_CLICK: 'SAVE_CONFIG_CLICK',
  SAVE_CONFIG_DRAFT: 'SAVE_CONFIG_DRAFT',
  SAVE_CONFIG_FAILURE: 'SAVE_CONFIG_FAILURE',
  RESET_CONFIG_DRAFT: 'RESET_CONFIG_DRAFT',
  LOAD: createRequestTypes('CONFIG_LOAD')
}

export const config = {
  initializeConfig: (config) => action(CONFIG.INITIALIZE_CONFIG, {config}),
  save: (config) => action(CONFIG.SAVE_CONFIG, {config}),
  markSaved: (saved) => action(CONFIG.SAVED_CONFIG, {saved}),
  saveClick: (config) => action(CONFIG.SAVE_CONFIG_CLICK),
  saveDraft: (draft) => action(CONFIG.SAVE_CONFIG_DRAFT, {draft}),
  saving: (saving) => action(CONFIG.SAVING_CONFIG, {saving}),
  resetDraft: (resetConfig) => action(CONFIG.RESET_CONFIG_DRAFT),

  failure: (error) => action(CONFIG.SAVE_CONFIG_FAILURE, {error}),

  load: {
    request: () => action(CONFIG.LOAD.REQUEST),
    success: (response) => action(CONFIG.LOAD.SUCCESS, {response}),
    failure: (error) => action(CONFIG.LOAD.FAILURE, {error})
  }
}

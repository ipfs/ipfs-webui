import {includes, reject} from 'lodash-es'
import {files as actions} from '../actions'

const defaultState = {
  list: [],
  root: '/',
  tmpDir: null,
  selected: []
}

export default function files (state = defaultState, action) {
  if (includes(actions.FILES_LIST, action.type) &&
      action.response) {
    return {
      ...state,
      list: action.response
    }
  }

  if (actions.FILES.SET_ROOT === action.type) {
    return {
      ...state,
      root: action.root
    }
  }

  if (actions.FILES.CREATE_TMP_DIR === action.type) {
    return {
      ...state,
      tmpDir: {
        root: action.root,
        name: ''
      }
    }
  }

  if (actions.FILES.RM_TMP_DIR === action.type) {
    return {
      ...state,
      tmpDir: null
    }
  }

  if (actions.FILES.SET_TMP_DIR_NAME === action.type) {
    return {
      ...state,
      tmpDir: {
        ...state.tmpDir,
        name: action.name
      }
    }
  }

  if (actions.FILES.SELECT_FILE === action.type) {
    return {
      ...state,
      selected: [...state.selected, action.file]
    }
  }

  if (actions.FILES.DESELECT_FILE === action.type) {
    return {
      ...state,
      selected: reject(state.selected, (f) => f === action.file)
    }
  }

  if (actions.FILES.DESELECT_ALL_FILE === action.type) {
    return {
      ...state,
      selected: []
    }
  }

  return state
}

import {createRequestTypes, action} from './utils'

export const FILES_LIST = createRequestTypes('FILES_LIST')
export const FILES_MKDIR = createRequestTypes('FILES_MKDIR')

export const FILES = {
  CANCEL: 'FILES_CANCEL',
  SET_ROOT: 'FILES_SET_ROOT',
  CREATE_TMP_DIR: 'FILES_CREATE_TMP_DIR',
  RM_TMP_DIR: 'FILES_RM_TMP_DIR',
  SET_TMP_DIR_NAME: 'FILES_SET_TMP_DIR_NAME',
  CREATE_DIR: 'FILES_CREATE_DIR'
}

export const filesList = {
  request: () => action(FILES_LIST.REQUEST),
  success: (response) => action(FILES_LIST.SUCCESS, {response}),
  failure: (error) => action(FILES_LIST.FAILURE, {error})
}

export const filesMkdir = {
  request: () => action(FILES_MKDIR.REQUEST),
  success: () => action(FILES_MKDIR.SUCCESS),
  failure: (error) => action(FILES_MKDIR.FAILURE, {error})
}

export const files = {
  cancel: () => action(FILES.CANCEL)
}

export const filesSetRoot = (root) => action(FILES.SET_ROOT, {root})
export const filesCreateTmpDir = (root) => action(FILES.CREATE_TMP_DIR, {root})
export const filesRmTmpDir = () => action(FILES.RM_TMP_DIR)
export const filesSetTmpDirName = (name) => action(FILES.SET_TMP_DIR_NAME, {name})
export const filesCreateDir = () => action(FILES.CREATE_DIR)

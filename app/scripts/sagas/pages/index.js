import {fork} from 'redux-saga/effects'
import {takeLatest} from 'redux-saga'

import {pages} from '../../actions'

import * as home from './home'
import * as peers from './peers'
import * as files from './files'
import * as preview from './preview'
import * as config from './config'
import * as logs from './logs'

const loaders = {
  home,
  peers,
  files,
  preview,
  config,
  logs
}

export default function * watchPages () {
  yield * Object.keys(loaders)
    .reduce((acc, name) => {
      const loader = loaders[name]

      if (loader.load) {
        acc.push(fork(function * () {
          yield * takeLatest(pages[name.toUpperCase()].LOAD, loader.load)
        }))
      }

      if (loader.leave) {
        acc.push(fork(function * () {
          yield * takeLatest(pages[name.toUpperCase()].LOAD, loader.leave)
        }))
      }

      return acc
    }, [])
}

/* global it, expect */
import { composeBundlesRaw, createReactorBundle } from 'redux-bundler'
import notifyBundle from './notify.js'
import sleep from '../../test/helpers/sleep.js'

const appTimeBundle = {
  name: 'appTime',
  reducer: () => Date.now(),
  selectAppTime: state => state.appTime
}

const ipfsBundle = (provider = 'kubo', opts) => {
  return Object.assign({}, {
    name: 'ipfs',
    selectIpfsProvider: () => provider
  }, opts)
}

it('should notify about api stats fetch errors', async () => {
  const store = composeBundlesRaw(
    appTimeBundle,
    ipfsBundle(),
    notifyBundle
  )()
  expect(store.selectNotify().show).toEqual(false)
  store.dispatch({ type: 'STATS_FETCH_FAILED', payload: { error: new Error('test') } })
  expect(store.selectNotify().show).toEqual(true)
  expect(store.selectNotify().error).toEqual(true)
  expect(store.selectNotifyI18nKey()).toEqual('ipfsApiRequestFailed')
})

it('should notify about connection returning after a previous error', async () => {
  const store = composeBundlesRaw(
    appTimeBundle,
    ipfsBundle(),
    notifyBundle
  )()
  expect(store.selectNotify().show).toEqual(false)
  store.dispatch({ type: 'STATS_FETCH_FAILED', payload: { error: new Error('test') } })
  expect(store.selectNotify().show).toEqual(true)
  expect(store.selectNotify().error).toEqual(true)
  expect(store.selectNotifyI18nKey()).toEqual('ipfsApiRequestFailed')
  store.dispatch({ type: 'STATS_FETCH_FINISHED' })
})

it('should dismiss connection ok message after 3s', async () => {
  let fakeTime = Date.now()
  const store = composeBundlesRaw(
    {
      name: 'appTime',
      reducer: () => fakeTime,
      selectAppTime: state => fakeTime
    },
    ipfsBundle(),
    notifyBundle,
    createReactorBundle()
  )()
  expect(store.selectNotify().show).toEqual(false)
  store.dispatch({ type: 'STATS_FETCH_FAILED', payload: { error: new Error('test') } })
  expect(store.selectNotify().show).toEqual(true)
  expect(store.selectNotify().error).toEqual(true)
  expect(store.selectNotifyI18nKey()).toEqual('ipfsApiRequestFailed')

  store.dispatch({ type: 'STATS_FETCH_FINISHED' })
  expect(store.selectNotify().show).toEqual(true)
  expect(store.selectNotify().error).toEqual(false)
  expect(store.selectNotify().eventId).toEqual('STATS_FETCH_FINISHED')

  // add 3s to the app time clock
  fakeTime = Date.now() + 3001
  store.dispatch({ type: 'APP_IDLE' })
  // wait for reactor to kick in
  await sleep(1)
  expect(store.selectNotify().show).toEqual(false)
})

it('should notify about file errors', async () => {
  const store = composeBundlesRaw(
    appTimeBundle,
    ipfsBundle(),
    notifyBundle
  )()
  expect(store.selectNotify().show).toEqual(false)
  store.dispatch({ type: 'FILES_WRITE_FAILED', payload: { error: new Error('test') } })
  expect(store.selectNotify().show).toEqual(true)
  expect(store.selectNotify().error).toEqual(true)
  expect(store.selectNotifyI18nKey()).toEqual('filesEventFailed')
  store.dispatch({ type: 'FILES_WRITE_FINISHED' })
})

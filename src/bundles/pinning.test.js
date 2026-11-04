import { jest } from '@jest/globals'
import pinningBundle from './pinning.js'

// pinning.js imports the TypeScript constants file by its .js name, which jest does not resolve
jest.mock('../constants/pinning.js', () => ({ pinningServiceTemplates: [] }), { virtual: true })

const CID_STR = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'

describe('pinning bundle init', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('refreshes pending remote pins instead of adding them again without a name', () => {
    const store = {
      selectIpfsReady: jest.fn(() => true),
      selectPendingPins: jest.fn(() => [`my-service:${CID_STR}`]),
      selectFailedPins: jest.fn(() => []),
      doSetPinning: jest.fn(),
      doFetchRemotePins: jest.fn()
    }

    pinningBundle.init(store)
    jest.advanceTimersByTime(1000)

    expect(store.doSetPinning).not.toHaveBeenCalled()
    expect(store.doFetchRemotePins).toHaveBeenCalledTimes(1)
    expect(store.doFetchRemotePins).toHaveBeenCalledWith([{ cid: CID_STR }], true)
  })

  it('does nothing when there are no pending remote pins', () => {
    const store = {
      selectIpfsReady: jest.fn(() => true),
      selectPendingPins: jest.fn(() => []),
      selectFailedPins: jest.fn(() => []),
      doSetPinning: jest.fn(),
      doFetchRemotePins: jest.fn()
    }

    pinningBundle.init(store)
    jest.advanceTimersByTime(1000)

    expect(store.doSetPinning).not.toHaveBeenCalled()
    expect(store.doFetchRemotePins).not.toHaveBeenCalled()
  })
})

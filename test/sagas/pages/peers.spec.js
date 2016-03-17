import {expect} from 'chai'
import {put, call, select, race, take, fork} from 'redux-saga/effects'

import {api} from '../../../app/scripts/services'
import {
  fetchPeerIds,
  fetchPeerDetails,
  fetchPeerLocations,
  watchPeers
} from '../../../app/scripts/sagas/pages/peers'
import {peers as actions, pages} from '../../../app/scripts/actions'
import {delay} from '../../../app/scripts/utils/promise'

describe('sagas - pages - peers', () => {
  describe('fetchPeerIds', () => {
    it('success', () => {
      const state = {
        peers: {
          ids: [{id: 1}, {id: 2}],
          locations: {1: {id: 1, val: 'hello'}}
        }
      }
      const generator = fetchPeerIds()

      expect(
        generator.next().value
      ).to.be.eql(
        put(actions.peerIds.request())
      )

      expect(
        generator.next().value
      ).to.be.eql(
        call(api.peerIds)
      )

      expect(
        generator.next([{id: 3}]).value
      ).to.be.eql(
        put(actions.peerIds.success([{id: 3}]))
      )

      expect(
        generator.next().value
      ).to.be.eql(
        select()
      )

      expect(
        generator.next(state).value
      ).to.be.eql(
        fork(fetchPeerDetails, [{id: 3}])
      )

      expect(
        generator.next().value
      ).to.be.eql(
        fork(fetchPeerLocations, [{id: 3}])
      )
    })

    it('failure', () => {
      const generator = fetchPeerIds()

      expect(
        generator.next().value
      ).to.be.eql(
        put(actions.peerIds.request())
      )

      expect(
        generator.next().value
      ).to.be.eql(
        call(api.peerIds)
      )

      expect(
        generator.throw(new Error('error')).value
      ).to.be.eql(
        put(actions.peerIds.failure('error'))
      )
    })
  })

  describe('fetchPeerDetails', () => {
    it('success', () => {
      const state = {
        peers: {
          ids: [{id: 1}, {id: 2}],
          details: {1: {id: 1, val: 'hello'}}
        }
      }
      const generator = fetchPeerDetails([{id: 2}])

      expect(
        generator.next().value
      ).to.be.eql(
        put(actions.peerDetails.request())
      )

      expect(
        generator.next().value
      ).to.be.eql(
        call(api.peerDetails, [{id: 2}])
      )

      expect(
        generator.next({2: {id: 2, val: 'world'}}).value
      ).to.be.eql(
        select()
      )

      expect(
        generator.next(state).value
      ).to.be.eql(
        put(actions.peerDetails.success({
          1: {id: 1, val: 'hello'},
          2: {id: 2, val: 'world'}
        }))
      )
    })

    it('failure', () => {
      const generator = fetchPeerDetails([])

      expect(
        generator.next().value
      ).to.be.eql(
        put(actions.peerDetails.request())
      )

      expect(
        generator.next().value
      ).to.be.eql(
        call(api.peerDetails, [])
      )

      expect(
        generator.throw(new Error('error')).value
      ).to.be.eql(
        put(actions.peerDetails.failure('error'))
      )
    })
  })

  describe('fetchPeerLocations', () => {
    it('success', () => {
      const state = {
        peers: {
          ids: [{id: 1}, {id: 2}],
          locations: {1: {id: 1, val: 'hello'}}
        }
      }
      const generator = fetchPeerLocations([{id: 2}])

      expect(
        generator.next().value
      ).to.be.eql(
        put(actions.peerLocations.request())
      )

      expect(
        generator.next().value
      ).to.be.eql(
        call(api.peerLocations, [{id: 2}])
      )

      expect(
        generator.next({2: {id: 2, val: 'world'}}).value
      ).to.be.eql(
        select()
      )

      expect(
        generator.next(state).value
      ).to.be.eql(
        put(actions.peerLocations.success({
          1: {id: 1, val: 'hello'},
          2: {id: 2, val: 'world'}
        }))
      )
    })

    it('failure', () => {
      const generator = fetchPeerLocations([])

      expect(
        generator.next().value
      ).to.be.eql(
        put(actions.peerLocations.request())
      )

      expect(
        generator.next().value
      ).to.be.eql(
        call(api.peerLocations, [])
      )

      expect(
        generator.throw(new Error('error')).value
      ).to.be.eql(
        put(actions.peerLocations.failure('error'))
      )
    })
  })

  it('watchPeers', () => {
    const generator = watchPeers()
    const racer = race({
      delay: call(delay, 5000),
      cancel: take(pages.PEERS.LEAVE)
    })

    expect(
      generator.next({}).value
    ).to.be.eql(
      call(fetchPeerIds)
    )

    expect(
      generator.next().value
    ).to.be.eql(
      racer
    )

    expect(
      generator.next({}).value
    ).to.be.eql(
      call(fetchPeerIds)
    )

    expect(
      generator.next().value
    ).to.be.eql(
      racer
    )

    expect(
      generator.next({}).value
    ).to.be.eql(
      call(fetchPeerIds)
    )

    expect(
      generator.next().value
    ).to.be.eql(
      racer
    )

    expect(
      generator.next({cancel: true}).value
    ).to.be.eql(
      put(actions.peers.cancel())
    )
  })
})

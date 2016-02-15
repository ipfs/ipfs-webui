import {expect} from 'chai'
import sinon from 'sinon'
import streamify from 'stream-array'

import {createLogSource} from '../../app/scripts/services/api'

function resolved (val) {
  return new Promise((resolve, reject) => {
    resolve(val)
  })
}

describe('api', () => {
  describe('createLogSource', () => {
    let api

    beforeEach(() => {
      api = {
        log: {
          tail: sinon.stub()
        }
      }
    })

    it('returns a pull source', () => {
      api.log.tail.returns(resolved(streamify([1, 2])))

      return createLogSource(api)
        .then((source) => {
          expect(source).to.have.property('getNext')

          return source.getNext()
            .then((val) => {
              expect(val).to.be.eql(1)
              return source.getNext()
            })
            .then((val) => {
              expect(val).to.be.eql(2)
              return source.getNext()
            })
            .catch((err) => {
              expect(err.message).to.be.eql('Stream ended')
            })
        })
    })
  })
})

/* global it expect */
import CID from 'cids'
import normaliseDagCbor from './normalise-dag-node'

const cid1 = 'zdpuAwkGh9cLskW5z7pH8V2uC5nwtSXd76L7ZTEXs5f8V89db'
const cid2 = 'zdpuAydka8ZEXd9UgWF1s4pVFcF4U1GEgtdNQFxKNt9tyKQxR'
const cid3 = 'zdpuAtYsbfdkVazNyWcS97cWKVzR99huDzNxMmoRb349jyUTD'

it('normalizes a simple cbor node', () => {
  const obj = { foo: 'bar' }
  const res = normaliseDagCbor(obj, cid1, 'dag-cbor')

  expect(res).toEqual({
    cid: cid1,
    data: obj,
    type: 'dag-cbor',
    links: []
  })
})

it('normalizes a cbor node with an empty array', () => {
  const obj = { foo: [] }
  const res = normaliseDagCbor(obj, cid1, 'dag-cbor')

  expect(res).toEqual({
    cid: cid1,
    data: obj,
    type: 'dag-cbor',
    links: []
  })
})

it('normalizes a cbor node with links', () => {
  const obj = {
    foo: new CID(cid2),
    bar: [new CID(cid2), new CID(cid3)]
  }

  const res = normaliseDagCbor(obj, cid1, 'dag-cbor')

  expect(res).toEqual({
    cid: cid1,
    data: obj,
    type: 'dag-cbor',
    links: [
      {
        path: 'foo',
        source: cid1,
        target: cid2
      },
      {
        path: 'bar/0',
        source: cid1,
        target: cid2
      },
      {
        path: 'bar/1',
        source: cid1,
        target: cid3
      }
    ]
  })
})

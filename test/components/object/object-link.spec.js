/* eslint-env mocha */

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'
import mh from 'multihashes'

import {parse} from '../../../src/js/utils/path'
import ObjectLink from '../../../src/js/components/object/object-link'

describe('ObjectLink', () => {
  it('renders links without a name', () => {
    const path = parse('/ipfs/hello/world')

    const el = shallow(<ObjectLink path={path} link={{
      multihash: mh.fromB58String('QmTm8QZmdYFKrT6EWBA7tfME2GXAdzkSkm7wtCZ2FqZVfT'),
      size: 2
    }} />)

    expect(el.find('Link').at(1))
      .to.have.prop('to', '/objects/ipfs/QmTm8QZmdYFKrT6EWBA7tfME2GXAdzkSkm7wtCZ2FqZVfT')
  })
})

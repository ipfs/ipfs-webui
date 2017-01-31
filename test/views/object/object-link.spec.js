import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'
import mh from 'multihashes'

import {parse} from '../../../app/scripts/utils/path'
import ObjectLink from '../../../app/scripts/views/object/object-link'

describe('ObjectLink', () => {
  it('renders the given link', () => {
    const path = parse('/ipfs/hello/world')
    const el = shallow(<ObjectLink path={path} link={{name: 'hi', multihash: mh.fromB58String('QmTm8QZmdYFKrT6EWBA7tfME2GXAdzkSkm7wtCZ2FqZVfT'), size: 2}} />)

    expect(el.find('Link')).to.have.length(2)
    expect(el.find('Link').at(0)).to.have.prop('to', 'objects/\\ipfs\\hello\\world\\hi')
    expect(el.find('Link').at(0).children()).to.have.text('hi')
  })

  it('renders links without a name', () => {
    const path = parse('/ipfs/hello/world')
    const el = shallow(<ObjectLink path={path} link={{multihash:  mh.fromB58String('QmTm8QZmdYFKrT6EWBA7tfME2GXAdzkSkm7wtCZ2FqZVfT'), size: 2}} />)

    expect(el.find('Link').at(0)).to.have.prop('to', 'objects/\\ipfs\\QmTm8QZmdYFKrT6EWBA7tfME2GXAdzkSkm7wtCZ2FqZVfT')
  })
})

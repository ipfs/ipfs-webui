/* eslint-env mocha */

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'
import mh from 'multihashes'

import {parse} from '../../../src/js/utils/path'
import ObjectLinks from '../../../src/js/views/object/object-links'

describe('ObjectLinks', () => {
  it('renders the given links', () => {
    const path = parse('/ipfs/hello/world')

    const links = [{
      name: 'hi',
      multihash: mh.fromB58String('QmTm8QZmdYFKrT6EWBA7tfME2GXAdzkSkm7wtCZ2FqZVfT'),
      size: 2
    }, {
      name: 'ho',
      multihash: mh.fromB58String('QmSb5Fmxvo7cWPQUiPiAVjqjaRji3J8CgpRucctqUzqtqQ'),
      size: 3
    }]

    const el = shallow(<ObjectLinks path={path} links={links} />)

    expect(el.find('strong')).to.have.text('Object links')
    expect(el.find('th').first()).to.have.text('Name')

    expect(el.find('ObjectLink').first()).to.have.prop('link').eql(links[0])
  })
})

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import {parse} from '../../../app/scripts/utils/path'
import ObjectLink from '../../../app/scripts/views/object/object-link'

describe('ObjectLink', () => {
  it('renders the given link', () => {
    const path = parse('/ipfs/hello/world')
    const el = shallow(<ObjectLink path={path} link={{Name: 'hi', Hash: '12', Size: 2}}/>)

    expect(el.find('Link')).to.have.length(2)
    expect(el.find('Link').at(0)).to.have.prop('to', 'objects/\\ipfs\\hello\\world\\hi')
    expect(el.find('Link').at(0).children()).to.have.text('hi')
  })

  it('renders links without a name', () => {
    const path = parse('/ipfs/hello/world')
    const el = shallow(<ObjectLink path={path} link={{Hash: 'Qm', Size: 2}}/>)

    expect(el.find('Link').at(0)).to.have.prop('to', 'objects/\\ipfs\\Qm')
  })
})

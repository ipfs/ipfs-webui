import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import {parse} from '../../../app/scripts/utils/path'
import ObjectLinks from '../../../app/scripts/views/object/object-links'

describe('ObjectLinks', () => {
  it('renders the given links', () => {
    const path = parse('/ipfs/hello/world')
    const links = [{
      Name: 'hi',
      Hash: 'Qm',
      Size: 2
    }, {
      Name: 'ho',
      Hash: 'Qp',
      Size: 3
    }]
    const el = shallow(<ObjectLinks path={path} links={links} />)

    expect(el.find('strong')).to.have.text('Object links')
    expect(el.find('th').first()).to.have.text('Name')

    expect(el.find('ObjectLink').first()).to.have.prop('link').eql(links[0])
  })
})

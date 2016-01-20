import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import {parse} from '../../../app/scripts/utils/path'

import Links from '../../../app/scripts/views/object/links'

describe('Links', () => {
  it('renders', () => {
    const path = parse('/ipfs/hello/world/data')
    const el = shallow(<Links path={path} links={[{Hash: 'Qm', Size: 2}]} />)

    expect(el.find('ObjectLinks')).to.have.prop('path').eql(path)
    expect(el.find('ObjectLinks')).to.have.prop('links').eql([{Hash: 'Qm', Size: 2}])
  })

  it('renders a message if the links list is empty', () => {
    const path = parse('/ipfs/hello/world/data')
    const el = shallow(<Links path={path} links={[]} />)

    expect(el.find('strong')).to.have.text('This object has no links')
  })
})

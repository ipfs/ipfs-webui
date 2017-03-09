import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import Welcome from '../../app/scripts/components/welcome'

describe('Welcome', () => {
  it('renders', () => {
    const node = { node: 'node' }
    const location = { location: 'location' }

    const el = shallow(<Welcome node={node} location={location} />)

    expect(el.find('NodeInfo')).to.have.prop('data').eql(node)
    expect(el.find('NodeInfo')).to.have.prop('location').eql(location)
    expect(el.find('h3')).to.have.text('Welcome to IPFS')
  })
})

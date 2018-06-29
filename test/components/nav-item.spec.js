/* eslint-env mocha */

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import NavItem from '../../src/js/components/nav-item'

describe('NavItem', () => {
  it('renders', () => {
    const el = shallow(<NavItem title='List' url='/list' icon='list' />)

    expect(el).to.have.prop('to', '/list')
    expect(el.find('Icon')).to.be.present()
    expect(el.find('Icon')).to.have.prop('glyph', 'list')
  })
})

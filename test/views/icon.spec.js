import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import Icon from '../../app/scripts/views/icon'

describe('Icon', () => {
  it('renders the given glyph', () => {
    const el = shallow(<Icon glyph='list'/>)
    expect(el).to.have.className('icon fa fa-list')
  })

  it('renders the given glyph with a large option', () => {
    const el = shallow(<Icon glyph='list' large/>)
    expect(el).to.have.className('icon fa fa-list fa-lg')
  })
})

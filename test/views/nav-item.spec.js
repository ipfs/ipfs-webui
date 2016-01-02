import {expect, shallowRender} from '../test-helpers'
import React from 'react'
import {Link} from 'react-router'

import Icon from '../../app/scripts/views/icon'
import NavItem from '../../app/scripts/views/nav-item'

describe('NavItem', () => {
  it('renders', () => {
    const el = shallowRender(<NavItem title='List' url='/list' icon='list'/>)

    expect(el).to.be.eql(
      <Link to='/list' className='link' activeClassName='active' >
        <Icon glyph='list'/> List
      </Link>
    )
  })
})

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import {parse} from '../../../app/scripts/utils/path'
import ParentLink from '../../../app/scripts/views/object/parent-link'

describe('ParentLink', () => {
  it('renders with a url', () => {
    const path = parse('/ipfs/hi/hello/world')
    const el = shallow(<ParentLink parent={path} />)

    expect(el.find('LinkContainer')).to.have.prop('to', '/objects/\\ipfs\\hi\\hello\\world')
  })

  it('renders an empty span if no url is provided', () => {
    const el = shallow(<ParentLink />)

    expect(el.find('span')).to.have.length(0)
  })
})

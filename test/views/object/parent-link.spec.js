/* eslint-env mocha */

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import {parse} from '../../../src/app/js/utils/path'
import ParentLink from '../../../src/app/js/views/object/parent-link'

describe('ParentLink', () => {
  it('renders with a url', () => {
    const path = parse('/ipfs/hi/hello/world')
    const el = shallow(<ParentLink parent={path} />)

    expect(el.find('LinkContainer')).to.have.prop('to', '/objects/\\ipfs\\hi\\hello\\world')
  })

  it('renders nothing if no url is provided', () => {
    const el = shallow(<ParentLink />)

    expect(el.find('LinkContainer')).to.have.length(0)
  })
})

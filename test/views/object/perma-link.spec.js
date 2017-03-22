import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import {parse} from '../../../app/scripts/utils/path'
import PermaLink from '../../../app/scripts/views/object/perma-link'

describe('PermaLink', () => {
  it('renders a given url', () => {
    const path = parse('/ipfs/hello/world')
    const el = shallow(<PermaLink url={path} />)

    console.log(el.html())

    expect(el.find('Link')).to.have.prop('to', '/objects/\\ipfs\\hello\\world')
    expect(el.find('Link').at(0).children()).to.have.text('/ipfs/hello/world')
  })

  it('renders nothing if no url given', () => {
    const el = shallow(<PermaLink />)

    expect(el.find('Link')).to.have.length(0)
  })
})

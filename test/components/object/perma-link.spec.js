/* eslint-env mocha */

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import {parse} from '../../../src/js/utils/path'
import PermaLink from '../../../src/js/components/object/perma-link'

describe.skip('PermaLink', () => {
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

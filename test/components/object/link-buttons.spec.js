/* eslint-env mocha */

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import Path, {parse} from '../../../src/js/utils/path'

import LinkButtons from '../../../src/js/components/object/link-buttons'

describe('LinkButtons', () => {
  it('renders', () => {
    const path = parse('/ipfs/hello/world/data')
    const el = shallow(<LinkButtons path={path} gateway='gate' />)

    expect(
      el.find('ParentLink')
    ).to.have.prop('parent').eql(new Path('ipfs', 'hello', '/world'))

    expect(
      el.find('Button').at(0)
    ).to.have.prop('href', 'gate/ipfs/hello/world/data')
    expect(
      el.find('Button').at(0).children()
    ).to.have.text('RAW')

    expect(
      el.find('Button').at(1)
    ).to.have.prop('href', 'gate/ipfs/hello/world/data?dl=1')
    expect(
      el.find('Button').at(1).children()
    ).to.have.text('Download')
  })
})

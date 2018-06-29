/* eslint-env mocha */

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import {parse} from '../../src/js/utils/path'
import ObjectView from '../../src/js/components/object'

describe('Object', () => {
  it('renders', () => {
    const path = parse('/ipfs/hello/world')
    const permalink = parse('/perma/hello/world')
    const el = shallow(
      <ObjectView
        path={path}
        permalink={permalink}
        gateway='gateway'
        object={{links: [], data: 'hello'}}
      />
    )

    expect(el.find('h4')).to.have.text('Object')
    expect(el.find('Links')).to.have.prop('links').eql([])
    expect(el.find('DisplayData')).to.have.prop('data', 'hello')
    expect(el.find('PermaLink')).to.have.prop('url', permalink)
  })
})

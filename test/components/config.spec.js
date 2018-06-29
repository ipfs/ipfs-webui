/* eslint-env mocha */

import {expect} from 'chai'
import {mount} from 'enzyme'
import React from 'react'

import ConfigView from '../../src/js/components/config'

describe('ConfigView', () => {
  it('renders the given config', () => {
    const config = {a: true, b: {c: 'hello'}}
    const el = mount(<ConfigView config={config} />)

    expect(el.find('textarea')).to.have.prop('value', JSON.stringify(config, null, 2))
  })
})

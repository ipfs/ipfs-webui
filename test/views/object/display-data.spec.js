/* eslint-env mocha */

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import DisplayData from '../../../src/app/js/views/object/display-data'

describe('DisplayData', () => {
  it('renders the given data', () => {
    const data = 'hello world'
    const el = shallow(<DisplayData data={data} />)

    expect(el.find('strong')).to.have.text('Object data (9 bytes)')
    expect(el.find('RawData')).to.have.prop('data', 'hello world')
  })

  it('renders a message if no data is provided', () => {
    const el = shallow(<DisplayData />)
    expect(el.find('strong')).to.have.text('This object has no data')
  })
})

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import ConfigView from '../../app/scripts/views/config'

describe('ConfigView', () => {
  it('renders the given config', () => {
    const config = {a: true, b: {c: 'hello'}}
    const el = shallow(<ConfigView config={config}/>)

    expect(el.find('textarea')).to.have.prop('value', JSON.stringify(config, null, 2))
  })
})

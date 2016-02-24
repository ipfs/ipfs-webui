import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import World from '../../app/scripts/components/world'

describe('World', () => {
  it('should have the correct defaults', () => {
    const el = shallow(<World/>)
    expect(el.find('WorldMap').length).to.equal(1)

    var inst = el.instance()
    expect(inst.props.peersCount).to.equal(0)
    expect(Object.keys(inst.props.locations).length)
      .to.equal(0)
  })

  it('should set peersCount', () => {
    const el = shallow(<World peersCount={1337}/>)
    expect(el.find('.counter').node.props.children).to.equal(1337)
  })
})

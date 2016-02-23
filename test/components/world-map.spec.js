import {expect} from 'chai'
import {shallow, render} from 'enzyme'
import React from 'react'

import WorldMap from '../../app/scripts/components/world-map'

describe('WorldMap', () => {
  const c = [[12, 14]]

  it('should render an svg', () => {
    const el = render(<WorldMap coordinates={c}/>)
    expect(el.find('svg').length).to.equal(1)
  })

  it('should have the correct coordiates', () => {
    const el = shallow(<WorldMap coordinates={c}/>)
    const p = el.instance().props

    c.forEach((coordinates, i) => {
      expect(coordinates[0]).to.equal(p[i][0])
      expect(coordinates[1]).to.equal(p[i][1])
    })
  })
})

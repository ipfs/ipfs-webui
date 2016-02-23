import {expect} from 'chai'
import {render} from 'enzyme'
import sinon from 'sinon'
import React from 'react'

import WorldMap from '../../app/scripts/components/world-map'

describe('WorldMap', () => {
  it('should render an svg', () => {
    const c = [[12, 14]]

    const el = render(<WorldMap coordinates={c}/>)
    expect(el.find('svg').length).to.equal(1)
  })
})

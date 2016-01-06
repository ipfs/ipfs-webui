import {expect, shallowRender} from '../test-helpers'
import React from 'react'

import Icon from '../../app/scripts/views/icon'

describe('Icon', () => {
  it('renders the given glyph', () => {
    const el = shallowRender(<Icon glyph='list'/>)
    expect(el).to.eql(<span aria-hidden='true' className='icon fa fa-list'></span>)
  })
  it('renders the given glyph with a large option', () => {
    const el = shallowRender(<Icon glyph='list' large/>)
    expect(el).to.eql(<span aria-hidden='true' className='icon fa fa-list fa-lg'></span>)
  })
})

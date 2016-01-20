import {expect, shallowRender} from '../../test-helpers'
import React from 'react'

import {parse} from '../../../app/scripts/utils/path'

import ObjectLinks from '../../../app/scripts/views/object/object-links'
import Links from '../../../app/scripts/views/object/links'

describe('Links', () => {
  it('renders', () => {
    const path = parse('/ipfs/hello/world/data')
    const el = shallowRender(<Links path={path} links={[{Hash: 'Qm', Size: 2}]} />)

    expect(el).to.contain(
      <ObjectLinks path={path} links={[{Hash: 'Qm', Size: 2}]}/>
    )
  })

  it('renders a message if the links list is empty', () => {
    const path = parse('/ipfs/hello/world/data')
    const el = shallowRender(<Links path={path} links={[]} />)

    expect(el).to.contain(
      <strong>This object has no links</strong>
    )
  })
})

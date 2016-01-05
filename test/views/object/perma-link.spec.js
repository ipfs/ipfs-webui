import {expect, shallowRender} from '../../test-helpers'
import React from 'react'
import {Link} from 'react-router'

import {parse} from '../../../app/scripts/utils/path'
import PermaLink from '../../../app/scripts/views/object/perma-link'

describe('PermaLink', () => {
  it('renders a given url', () => {
    const path = parse('/ipfs/hello/world')
    const el = shallowRender(<PermaLink url={path} />)

    expect(el).to.contain(
      <Link to='/objects/\ipfs\hello\world'>/ipfs/hello/world</Link>
    )
  })

  it('renders an empty span if no url given', () => {
    const el = shallowRender(<PermaLink />)

    expect(el).to.be.eql(
      <span></span>
    )
  })
})

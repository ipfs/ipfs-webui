import {expect, shallowRender} from '../../test-helpers'
import React from 'react'

import {parse} from '../../../app/scripts/utils/path'
import ObjectLink from '../../../app/scripts/views/object/object-link'
import ObjectLinks from '../../../app/scripts/views/object/object-links'

describe('ObjectLinks', () => {
  it('renders the given links', () => {
    const path = parse('/ipfs/hello/world')
    const links = [{
      Name: 'hi',
      Hash: 'Qm',
      Size: 2
    }, {
      Name: 'ho',
      Hash: 'Qp',
      Size: 3
    }]
    const el = shallowRender(<ObjectLinks path={path} links={links}/>)

    expect(el).to.contain(
      <strong>Object links</strong>
    )

    expect(el).to.contain(
      <th>Name</th>
    )

    expect(el).to.contain(
      <ObjectLink link={links[0]} path={path} />
    )
  })
})

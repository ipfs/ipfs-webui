import {expect, shallowRender} from '../../test-helpers'
import React from 'react'
import {Link} from 'react-router'

import {parse} from '../../../app/scripts/utils/path'
import ObjectLink from '../../../app/scripts/views/object/object-link'

describe('ObjectLink', () => {
  it('renders the given link', () => {
    const path = parse('/ipfs/hello/world')
    const el = shallowRender(<ObjectLink path={path} link={{Name: 'hi', Hash: '12', Size: 2}}/>)

    expect(el).to.eql(
      <tr>
        <td>
          <Link to='objects/\ipfs\hello\world\hi'>hi</Link>
        </td>
        <td>
          <Link to='objects/\ipfs\hello\world\hi'>12</Link>
        </td>
        <td>2</td>
      </tr>
    )
  })

  it('renders links without a name', () => {
    const path = parse('/ipfs/hello/world')
    const el = shallowRender(<ObjectLink path={path} link={{Hash: 'Qm', Size: 2}}/>)

    expect(el).to.contain(
      <Link to='objects/\ipfs\Qm'>Qm</Link>
    )
  })
})

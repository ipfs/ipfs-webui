import {expect, shallowRender} from '../../test-helpers'
import React from 'react'
import {Link} from 'react-router'

import {parse} from '../../../app/scripts/utils/path'
import Icon from '../../../app/scripts/views/icon'
import ParentLink from '../../../app/scripts/views/object/parent-link'

describe('ParentLink', () => {
  it('renders with a url', () => {
    const path = parse('/ipfs/hi/hello/world')
    const el = shallowRender(<ParentLink parent={path}/>)

    expect(el).to.eql(
      <Link className='btn btn-primary' to='/objects/\ipfs\hi\hello\world' >
        <Icon glyph='arrow-up' /> Parent object
      </Link>
    )
  })

  it('renders an empty span if no url is provided', () => {
    const el = shallowRender(<ParentLink />)

    expect(el).to.eql(
      <span></span>
    )
  })
})

import {expect, shallowRender} from '../../test-helpers'
import React from 'react'

import Path, {parse} from '../../../app/scripts/utils/path'

import ParentLink from '../../../app/scripts/views/object/parent-link'
import LinkButtons from '../../../app/scripts/views/object/link-buttons'

describe('LinkButtons', () => {
  it('renders', () => {
    const path = parse('/ipfs/hello/world/data')
    const el = shallowRender(<LinkButtons path={path} gateway='gate' />)

    expect(el).to.contain(
      <ParentLink parent={new Path('ipfs', 'hello', '/world')} />
    )

    expect(el).to.contain(
      <a href='gate/ipfs/hello/world/data' className='btn btn-info btn-second' target='_blank'>
        RAW
      </a>
    )

    expect(el).to.contain(
      <a href='gate/ipfs/hello/world/data?dl=1' className='btn btn-second' target='_blank'>
        Download
      </a>
    )
  })
})

import {expect, shallowRender} from '../../test-helpers'
import React from 'react'
import {Button} from 'react-bootstrap'

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
      <Button
          bsStyle='info'
          className='btn-second'
          href='gate/ipfs/hello/world/data'
          target='_blank'
      >
        RAW
      </Button>
    )

    expect(el).to.contain(
      <Button
          href='gate/ipfs/hello/world/data?dl=1'
          className='btn-second'
          target='_blank'
      >
        Download
      </Button>
    )
  })
})

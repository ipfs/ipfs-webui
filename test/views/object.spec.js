import {expect, shallowRender} from '../test-helpers'
import React from 'react'

import {parse} from '../../app/scripts/utils/path'
import ObjectView from '../../app/scripts/views/object'

import Links from '../../app/scripts/views/object/links'
import DisplayData from '../../app/scripts/views/object/display-data'
import PermaLink from '../../app/scripts/views/object/perma-link'

describe('Object', () => {
  it('renders', () => {
    const path = parse('/ipfs/hello/world')
    const permalink = parse('/perma/hello/world')
    const el = shallowRender(
      <ObjectView
          path={path}
          permalink={permalink}
          gateway='gateway'
          object={{Links: [], Data: 'hello'}}
      />
    )

    expect(el).to.contain(
      <h4>Object</h4>
    )

    expect(el).to.contain(
      <Links path={path} links={[]} />
    )

    expect(el).to.contain(
      <DisplayData data='hello' />
    )

    expect(el).to.contain(
      <PermaLink url={permalink} />
    )
  })
})

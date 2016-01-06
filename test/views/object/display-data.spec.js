import {expect, shallowRender} from '../../test-helpers'
import React from 'react'

import RawData from '../../../app/scripts/views/object/raw-data'
import DisplayData from '../../../app/scripts/views/object/display-data'

describe('DisplayData', () => {
  it('renders the given data', () => {
    const data = 'hello world'
    const el = shallowRender(<DisplayData data={data} />)

    expect(el).to.contain(
      <strong>Object data (9 bytes)</strong>
    )

    expect(el).to.contain(
      <RawData data='hello world' />
    )
  })

  it('renders a message if no data is provided', () => {
    const el = shallowRender(<DisplayData />)

    expect(el).to.be.contain(
      <strong>This object has no data</strong>
    )
  })
})

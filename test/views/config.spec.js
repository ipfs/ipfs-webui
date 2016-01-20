import {expect, shallowRender} from '../test-helpers'
import React from 'react'

import ConfigView from '../../app/scripts/views/config'

describe('ConfigView', () => {
  it('renders the given config', () => {
    const config = {a: true, b: {c: 'hello'}}
    const el = shallowRender(<ConfigView config={config}/>)

    expect(el).to.contain(
      <textarea
          ref='textareaConfig'
          className='panel-inner'
          spellCheck='false'
          style={{height: 0}}
          onChange={() => {}}
          value={JSON.stringify(config, null, 2)}
      />
    )
  })
})

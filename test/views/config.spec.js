import {expect} from 'chai'
import React from 'react'
import Test from 'legit-tests/no-dom'

import ConfigView from '../../app/scripts/views/config'

describe('ConfigView', () => {
  it('renders the given config', () => {
    const config = {a: true, b: {c: 'hello'}}
    Test(<ConfigView config={config}/>)
    .find('textarea')
    .test(({textarea}) => {
      expect(textarea.value).to.be.eql(JSON.stringify(config, null, 2))
    })
  })
})

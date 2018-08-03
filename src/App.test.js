/* global it */
import React from 'react'
import { shallow } from 'enzyme'
import { App } from './App'

it('renders without crashing', () => {
  const noop = () => {}
  const Page = () => 'test'

  shallow(
    <App doInitIpfs={noop} doUpdateUrl={noop} route={Page} routeInfo={{url: '/'}} />
  )
})

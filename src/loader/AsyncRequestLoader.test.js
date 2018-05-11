/* global it expect */
import React from 'react'
import { shallow } from 'enzyme'
import { AsyncRequestLoader } from './AsyncRequestLoader'
import { Loader } from './Loader'

it('renders nothing if there are no async requests', () => {
  const wrapper = shallow(
    <AsyncRequestLoader asyncActive={false} />
  )
  expect(wrapper.getElement()).toBe(null)
})

it('renders a Loader if there are pending requests', () => {
  const wrapper = shallow(
    <AsyncRequestLoader asyncActive />
  )
  expect(wrapper.is(Loader)).toBe(true)
})

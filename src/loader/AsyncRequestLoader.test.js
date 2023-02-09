/* global it expect */
import React from 'react'
import enzyme from 'enzyme'
import { AsyncRequestLoader } from './AsyncRequestLoader.js'
const { shallow } = enzyme

it('hidden if there are no async requests', () => {
  const wrapper = shallow(
    <AsyncRequestLoader asyncActive={false} />
  )
  expect(wrapper.find('.o-0').exists()).toBe(true)
})

it('visible if there are pending requests', () => {
  const wrapper = shallow(
    <AsyncRequestLoader asyncActive />
  )
  expect(wrapper.find('.o-100').exists()).toBe(true)
})

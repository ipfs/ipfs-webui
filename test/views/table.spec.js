/* eslint-env mocha */

import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import TableView from '../../src/app/js/views/table'

describe('TableView', () => {
  it('renders a table with multiple rows and children', () => {
    const table = [1, 2, 3]
    const children = [<span key='1'>foo</span>]
    const el = shallow(<TableView table={table} children={children} />)

    expect(el.find('tr').length).to.equal(3)
    expect(el.find('span').length).to.equal(1)
  })
})

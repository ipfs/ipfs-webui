import {expect} from 'chai'
import {render} from 'enzyme'
import React from 'react'

import Flag from '../../app/scripts/components/flag'

describe('flag', () => {
  it('should render country and flag', () => {
    const country = 'country'
    const el = render(<Flag country={country} square />)

    expect(el.find('.flag-icon.flag-icon-country.flag-icon-squared').length)
      .to.equal(1)
  })

  it('should not render flag unless specified', () => {
    const country = 'country'
    const el = render(<Flag country={country} square={false} />)

    expect(el.find('.flag-icon.flag-icon-country.flag-icon-squared').length)
      .to.equal(0)
  })
})

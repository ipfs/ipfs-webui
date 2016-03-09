import {expect} from 'chai'
import {render} from 'enzyme'
import React from 'react'

import ConfigButtons from '../../app/scripts/components/config-buttons'

describe('ConfigButtons', () => {
  it('should render', () => {
    const el = render(
      <ConfigButtons
        saving={false}
        saved={false}
        saveClick={function () {}}
        resetDraft={function () {}}
      />
    )

    expect(el.find('button').length).to.equal(2)
    expect(el.find('.fa-save').length).to.equal(1)
    expect(el.find('.disabled').length).to.equal(0)
  })

  it('should display different icons if saved', () => {
    const el = render(
      <ConfigButtons
        saving
        saved
        saveClick={function () {}}
        resetDraft={function () {}}
      />
    )

    expect(el.find('.fa-check').length).to.equal(1)
    expect(el.find('.fa-save').length).to.equal(0)
    expect(el.find('.disabled').length).to.equal(1)
  })
})

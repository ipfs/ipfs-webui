import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import {ConfigContainer} from '../../app/scripts/containers/config'

describe('ConfigContainer', () => {
  it('should render config text and buttons', () => {
    const el = shallow(
      <ConfigContainer
        load={function () {}}
        leave={function () {}}
        saveClick={function () {}}
        saveDraft={function () {}}
        markSaved={function () {}}
        resetDraft={function () {}}
        draft={'draft'}
        saving
        saved
      />
    )

    expect(el.find('ConfigText').props().draft).to.eql('draft')
    expect(el.find('ConfigButtons').props().saved).to.eql(true)
  })
})

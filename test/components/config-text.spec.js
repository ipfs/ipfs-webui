import {expect} from 'chai'
import {shallow} from 'enzyme'
import React from 'react'

import ConfigText from '../../app/scripts/components/config-text'
import sinon from 'sinon'

describe('ConfigText', () => {
  describe('handleChange', () => {
    it('should saveDraft and markSaved', () => {
      const configText = new ConfigText()
      configText.props = {
        saveDraft: sinon.stub(),
        markSaved: sinon.stub(),
        saved: true
      }

      const event = {
        target: {
          value: 'body'
        }
      }

      configText.handleChange(event)
      expect(configText.props.saveDraft.called).to.be.true
      expect(configText.props.markSaved.called).to.be.true
    })
  })

  describe('render', () => {
    it('should render a textarea with draft', () => {
      const el = shallow(
        <ConfigText
          saveDraft={function () {}}
          markSaved={function () {}}
          draft={'draft'}
          saved={false}
        />
      )

      expect(el.find('.panel-inner').props().value).to.equal('draft')
    })
  })
})

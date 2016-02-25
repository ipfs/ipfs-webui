import {expect} from 'chai'
import {render, shallow} from 'enzyme'
import React from 'react'
import sinon from 'sinon'

import PeersViewer from '../../app/scripts/components/peers-viewer'

describe('PeersViewer', () => {
  const peersViewer = new PeersViewer()

  describe('idCellRenderer', () => {
    it('should render with correct id strings', () => {
      const id = 'randomlonghashstringlol'

      const el = shallow(peersViewer._idCellRenderer(id))
      expect(el.find('Identicon').props().id).to.equal(id.substring(2))

      // first child is Identicon. Second child would be element text
      expect(el.find('.id-entry-wrapper').props().children[1])
        .to.equal(id.substring(2, 10))
    })
  })

  describe('locationCellRenderer', () => {
    it('should render with correct location values', () => {
      const location = {
        country_code: 'country_code',
        city: 'city',
        country_name: 'country_name'
      }

      const el = shallow(peersViewer._locationCellRenderer(location))
      expect(el.find('Flag').props().country).to.equal(location.country_code)
      // Flag is first child of this component's div. text is second

      const text = location.city + ', ' + location.country_name
      expect(el.find('div').props().children[1]).to.equal(text)
    })
  })

  describe('agentCellRenderer', () => {
    it('should render with correct base and version', () => {
      const agent = 'base/version'

      const el = shallow(peersViewer._agentCellRenderer(agent))

      // the strong element in this component has no children
      expect(el.find('strong').props().children)
        .to.equal('base')

      // span's children: strong, forward-slash, version
      expect(el.find('span').props().children[2])
        .to.equal('version')
    })

    it('should return a dash if no agent', () => {
      expect(peersViewer._agentCellRenderer()).to.equal('-')
    })
  })

  describe('_createTable', () => {
    it('should render with correct attributes', () => {
      const list = [1]

      const el = shallow(peersViewer._createTable(list)({
        width: 1000,
        height: 2000
      }))

      const inst = el.instance()
      expect(inst.props.width).to.equal(1000)
      expect(inst.props.height).to.equal(2000)
      expect(inst.props.rowsCount).to.equal(list.length)
    })

    it('should have the correct # of rows and columns', () => {
      const list = [1, 2]
      const s = sinon.sandbox.create()

      s.stub(peersViewer, '_idCellRenderer').returns(<div className={'foo'}/>)
      s.stub(peersViewer, '_locationDataGetter').returns(<div className={'foo'}/>)
      s.stub(peersViewer, '_locationCellRenderer').returns(<div className={'foo'}/>)
      s.stub(peersViewer, '_agentCellRenderer').returns(<div className={'foo'}/>)

      const el = render(peersViewer._createTable(list)({
        width: 1000,
        height: 2000
      }))

      const fields = [
        '.id-entry',
        '.address-entry',
        '.location-entry',
        '.agent-entry'
      ]

      fields.forEach((v) => {
        // 2 rows means 2 of each column
        expect(el.find(v).length).to.equal(2)
      })

      s.restore()
    })
  })

  describe('shouldComponentUpdate', () => {
    it('should return true if nextProps and this.props are different', () => {
      const nextProps = 'nextProps'

      expect(peersViewer.shouldComponentUpdate(nextProps)).to.equal(true)
    })
  })

  describe('render', () => {
    const locations = {
      id: {
        city: 'city'
      }
    }

    const ids = [{
      address: 'address',
      id: 'id',
      location: location
    }]

    it('should an AutoSizer element', () => {
      // ids is an array of objects with fields address, id, location
      // Details is peerId:
      const details = {
        id: {
          address: 'address2',
          id: 'id',
          location: location
        }
      }

      // Details is peerId:
      const el = shallow(<PeersViewer
        ids={ids}
        details={details}
        locations={locations}/>
      )

      expect(el.find('AutoSizer').length).to.equal(1)
    })
  })
})

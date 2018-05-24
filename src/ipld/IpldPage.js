import React from 'react'
import { connect } from 'redux-bundler-react'
import CidInfo from './cid-info/CidInfo'
import ObjectInfo from './object-info/ObjectInfo'
import IpldGraph from './graph/IpldGraphCytoscape'

class IpldPage extends React.Component {
  constructor (props) {
    super(props)
    this.onLinkClick = this.onLinkClick.bind(this)
  }
  onLinkClick (link) {
    const {doUpdateHash, hash} = this.props
    const {name} = link
    doUpdateHash(hash + '/' + name)
  }
  render () {
    const {object} = this.props
    return (
      <div>
        <div className='dt dt--fixed'>
          <div className='dtc w-two-thirds pr3 v-top'>
            {object && object.resolved ? (
              <ObjectInfo
                style={{background: '#FBFBFB'}}
                cid={object.resolved.multihash}
                size={object.resolved.size}
                links={object.resolved.links}
                data={object.resolved.data || object.resolved}
                type={object.resolved.type}
                onLinkClick={this.onLinkClick} />
            ) : null}
          </div>
          <div className='dtc w-third v-top'>
            {object && object.resolved ? (
              <div>
                <CidInfo
                  style={{background: '#FBFBFB'}}
                  cid={object.resolved.multihash} />
                <IpldGraph
                  style={{width: '100%', height: 300}}
                  path={object.resolved.multihash}
                  links={object.resolved.links}
                  onNodeClick={this.onLinkClick} />
              </div>
            ) : null}
          </div>
        </div>
        <h1 data-id='title'>IPLD</h1>
      </div>
    )
  }
}

export default connect('selectRouteParams', 'selectObject', 'selectHash', 'doUpdateHash', IpldPage)

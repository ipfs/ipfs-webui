import React from 'react'
import { connect } from 'redux-bundler-react'
import CidInfo from './cid-info/CidInfo'
import ObjectInfo from './object-info/ObjectInfo'
import IpldGraph from './graph/IpldGraphCytoscape'

class ExplorePage extends React.Component {
  constructor (props) {
    super(props)
    this.onLinkClick = this.onLinkClick.bind(this)
  }
  onLinkClick (link) {
    const {doUpdateHash, hash} = this.props
    const {path} = link
    doUpdateHash(hash + '/' + path)
  }
  render () {
    const {explore} = this.props
    console.log('ExplorePage render', explore)
    if (!explore) return <h1>no explore obj</h1>
    const targetNode = explore.nodes[explore.nodes.length - 1]
    return (
      <div>
        <div className='dt dt--fixed'>
          <div className='dtc w-two-thirds pr3 v-top'>
            {targetNode ? (
              <ObjectInfo
                style={{background: '#FBFBFB'}}
                cid={targetNode.cid}
                size={targetNode.size}
                links={targetNode.links}
                data={targetNode.data}
                type={targetNode.type}
                onLinkClick={this.onLinkClick} />
            ) : null}
          </div>
          <div className='dtc w-third v-top'>
            {targetNode ? (
              <div>
                <CidInfo
                  style={{background: '#FBFBFB'}}
                  cid={targetNode.cid} />
                <IpldGraph
                  style={{width: '100%', height: 300}}
                  path={targetNode.cid}
                  links={targetNode.links}
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

export default connect('selectRouteParams', 'selectExplore', 'selectHash', 'doUpdateHash', ExplorePage)

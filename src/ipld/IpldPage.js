import React from 'react'
import { connect } from 'redux-bundler-react'
import CidInfo from './cid-info/CidInfo'

class IpldPage extends React.Component {
  render () {
    const {path} = this.props.routeParams
    // todo detect all the things (/ipfs /ipns etc)
    const cidStr = path ? path.replace('/ipfs', '').substring(1) : null
    return (
      <div>
        <CidInfo cid={cidStr} />
        <h1 data-id='title'>IPLD</h1>
      </div>
    )
  }
}

export default connect('selectRouteParams', IpldPage)

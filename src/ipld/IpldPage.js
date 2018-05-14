import React from 'react'
import { connect } from 'redux-bundler-react'
import { decodeCid } from '../lib/cid'

class IpldPage extends React.Component {
  render () {
    const {path} = this.props.routeParams
    // todo detect all the things (/ipfs /ipns etc)
    const cidStr = path ? path.replace('/ipfs', '').substring(1) : null
    let cidErr = null
    let cidInfo = null
    try {
      cidInfo = cidStr ? decodeCid(cidStr) : null
    } catch (err) {
      cidErr = err
    }

    return (
      <div>
        {!cidInfo ? null : (
          <section className='bg-snow-muted pa3'>
            <label className='db'>
              <a className='tracked ttu f6 fw2 teal-muted hover-aqua link' href='https://github.com/ipld/cid#human-readable-cids'>
                Human readable CID
              </a>
            </label>
            <pre className='f5 sans-serif fw5 ma0 pv2 dib overflow-x-auto w-100 truncate'>
              {`${cidInfo.multibase.name} - cidv${cidInfo.cid.version} - ${cidInfo.cid.codec} - ${cidInfo.multihash.name}-${cidInfo.multihash.length * 8}-${cidInfo.multihash.digest.toString('hex')}`}
            </pre>
            <div className='fw2 ma0 gray ttu f7 tracked'>multibase - version -  multicodec - multihash</div>
          </section>
        )}
        {!cidErr ? null : (
          <section className='bg-snow pa3'>
            <div className='f6'>{path}</div>
            <p className='red f5 mb0'>{cidErr.message}</p>
          </section>
        )}
        <h1 data-id='title'>IPLD</h1>
      </div>
    )
  }
}

export default connect('selectRouteParams', IpldPage)

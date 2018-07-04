import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'
import ErrorBoundary from '../components/error/ErrorBoundary'
import CidInfo from './cid-info/CidInfo'
import ObjectInfo, { colorForNode, nameForNode, shortNameForNode } from './object-info/ObjectInfo'
import IpldGraph from './graph/IpldGraphCytoscape'
import GraphCrumb from './graph-crumb/GraphCrumb'

class ExplorePage extends React.Component {
  constructor (props) {
    super(props)
    this.onLinkClick = this.onLinkClick.bind(this)
  }

  onLinkClick (link) {
    const {doUpdateHash, explore} = this.props
    const {nodes, pathBoundaries} = explore
    const cid = nodes[0].cid
    const basePath = pathBoundaries.map(p => p.path).join('/')
    const path = basePath ? `${basePath}/${link.path}` : link.path
    // Reliably derive the url from the data, rather than the current hash
    const hash = `#/explore/${cid}/${path}`
    doUpdateHash(hash)
  }

  render () {
    const {explore} = this.props
    if (!explore) return <StartExploringPage />
    const {targetNode, localPath, nodes, pathBoundaries} = explore
    const sourceNode = nodes[0]
    return (
      <div className='nl3 nt4'>
        <Helmet>
          <title>Explore - IPFS</title>
        </Helmet>
        {pathBoundaries && targetNode ? (
          <GraphCrumb
            className='ml4 mt3 mb3'
            cid={sourceNode.cid}
            pathBoundaries={pathBoundaries}
            localPath={localPath} />
        ) : null}
        <div className='dt dt--fixed'>
          <div className='dtc w-two-thirds pr3 v-top'>
            {targetNode ? (
              <ObjectInfo
                style={{background: '#FBFBFB'}}
                cid={targetNode.cid}
                localPath={localPath}
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
                <ErrorBoundary>
                  <IpldGraph
                    style={{width: '100%', height: 300}}
                    path={targetNode.cid}
                    links={targetNode.links}
                    onNodeClick={this.onLinkClick} />
                </ErrorBoundary>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}

const ExploreSuggestion = ({cid, name, type}) => {
  return (
    <a className='flex items-center lh-copy pa3 ph0-l bb b--black-10 link focus-outline' href={`#/explore/${cid}`}>
      <span className='flex items-center justify-center w3 h3 br-100 tc' style={{background: colorForNode(type)}}>
        <span className='fw2 f4 snow montserrat' title={nameForNode(type)}>{shortNameForNode(type)}</span>
      </span>
      <span className='pl3 flex-auto'>
        <span className='f5 db black-70'>{name}</span>
        <span className='f7 db blue monospace'>{cid}</span>
      </span>
    </a>
  )
}

const StartExploringPage = () => {
  return (
    <div>
      <Helmet>
        <title>Explore - IPFS</title>
      </Helmet>
      <div className=''>
        <div className='db dib-l w-50-l v-top'>
          <div className='pr5'>
            <h1 className='fw2 montserrat'>Explore the Merkle Forest</h1>
            <p className='lh-copy f6 charcoal-muted'>Paste a CID into the explore box above to browse the IPLD node it addresses, or click on an option below.</p>
            <ul className='list pl0 ma0 measure'>
              <li>
                <ExploreSuggestion name='The IPLD Website' cid='QmTxRvftPnKeR7iJfeVpfsGCYEwZ92ot9zrTksAWUACTs7' type='dag-pb' />
              </li>
              <li>
                <ExploreSuggestion name='My favourites' cid='zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs' type='dag-cbor' />
              </li>
              <li>
                <ExploreSuggestion name='Project Apollo Archives' cid='QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D' type='dag-pb' />
              </li>
              <li>
                <ExploreSuggestion name='XKCD' cid='QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm' type='dag-pb' />
              </li>
            </ul>
          </div>
        </div>
        <Box className='db dib-l pa4 w-50-l lh-copy dark-gray'>
          <div className='tc'>
            <a className='link' href='https://ipfs.io/ipns/ipld.io'>
              <img src={require('./ipld.svg')} alt='IPLD' />
            </a>
          </div>
          <p>IPLD is <strong>the data model of the content-addressable web.</strong> It allows us to treat all hash-linked data structures as subsets of a unified information space, unifying all data models that link data with hashes as instances of IPLD.</p>
          <p>Content addressing through hashes has become a widely-used means of connecting data in distributed systems, from the blockchains that run your favorite cryptocurrencies, to the commits that back your code, to the web’s content at large. Yet, whilst all of these tools rely on some common primitives, their specific underlying data structures are not interoperable.</p>
          <p>Enter IPLD: a single namespace for all hash-inspired protocols. Through IPLD, links can be traversed across protocols, allowing you explore data regardless of the underlying protocol.</p>
        </Box>
      </div>
    </div>
  )
}

export default connect('selectRouteParams', 'selectExploreIsLoading', 'selectExplore', 'selectHash', 'doUpdateHash', ExplorePage)

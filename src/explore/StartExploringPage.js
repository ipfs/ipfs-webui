import React from 'react'
import { Helmet } from 'react-helmet'
import Box from '../components/box/Box'
import Tooltip from '../components/tooltip/Tooltip'
import { colorForNode, nameForNode, shortNameForNode } from './object-info/ObjectInfo'
import ipldLogoSrc from './ipld.svg'

const ExploreSuggestion = ({cid, name, type}) => {
  return (
    <a className='flex items-center lh-copy pa3 ph0-l bb b--black-10 link focus-outline' href={`#/explore/${cid}`}>
      <span className='flex items-center justify-center w3 h3 flex-shrink-0 br-100 tc' style={{background: colorForNode(type)}}>
        <span className='fw2 f4 snow montserrat' title={nameForNode(type)}>{shortNameForNode(type)}</span>
      </span>
      <span className='pl3 flex-auto'>
        <span className='f5 db black-70'>{name}</span>
        <Tooltip text={cid}>
          <span className='f7 db blue truncate monospace'>{cid}</span>
        </Tooltip>
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
          <div className='pr5-l'>
            <h1 className='fw2 montserrat'>Explore the Merkle Forest</h1>
            <p className='lh-copy f6 charcoal-muted'>Paste a CID into the explore box above to browse the IPLD node it addresses, or click on an option below.</p>
            <ul className='list pl0 ma0'>
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
              <img src={ipldLogoSrc} alt='IPLD' />
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

export default StartExploringPage

import React from 'react'
import { Trans, withTranslation } from 'react-i18next'
import Box from '../box/Box'
import ipldLogoSrc from './ipld.svg'

export const AboutIpld = ({ t }) => {
  return (
    <Box className='tl dib pa4 spacegrotesk measure-wide-l lh-copy white dark-gray ba-l b--black-10' bg='transparent'>
      <div className='tc'>
        <a className='link' href='https://ipld.io'>
          <img src={ipldLogoSrc} alt='IPLD' style={{ height: 60 }} />
        </a>
      </div>
      <Trans i18nKey='AboutIpld.paragraph1' t={t}>
        <p>IPLD is <strong>the data model of the content-addressable web.</strong> It allows us to treat all hash-linked data structures as subsets of a unified information space, unifying all data models that link data with hashes as instances of IPLD.</p>
      </Trans>
      <Trans i18nKey='AboutIpld.paragraph2' t={t}>
        <p>Content addressing through hashes has become a widely-used means of connecting data in distributed systems, from the blockchains that run your favorite cryptocurrencies, to the commits that back your code, to the web’s content at large. Yet, whilst all of these tools rely on some common primitives, their specific underlying data structures are not interoperable.</p>
      </Trans>
      <Trans i18nKey='AboutIpld.paragraph3' t={t}>
        <p>Enter IPLD: a single namespace for all hash-inspired protocols. Through IPLD, links can be traversed across protocols, allowing you to explore data regardless of the underlying protocol.</p>
      </Trans>
    </Box>
  )
}

export default withTranslation('explore')(AboutIpld)

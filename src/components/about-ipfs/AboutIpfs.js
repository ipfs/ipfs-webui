import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Box from '../box/Box.js'

export const AboutIpfs = ({ t }) => {
  return (
    <Box>
      <h2 className='mt0 mb3 montserrat fw2 f3 charcoal'>{t('aboutIpfs.header')}</h2>
      <ul className='pl3'>
        <Trans i18nKey='aboutIpfs.paragraph1' t={t}>
          <li className='mb2'><strong>A hypermedia distribution protocol</strong> that incorporates ideas from Kademlia, BitTorrent, Git, and more</li>
        </Trans>
        <Trans i18nKey='aboutIpfs.paragraph2' t={t}>
          <li className='mb2'><strong>A peer-to-peer file transfer network</strong> with a completely decentralized architecture and no central point of failure, censorship, or control</li>
        </Trans>
        <Trans i18nKey='aboutIpfs.paragraph3' t={t}>
          <li className='mb2'><strong>An on-ramp to tomorrow's web</strong> &mdash; traditional browsers can access IPFS files through gateways like <code className='f5 bg-light-gray br2 pa1'>https://ipfs.io</code> or directly using the <a className='link blue' target='_blank' rel='noopener noreferrer' href='https://github.com/ipfs-shipyard/ipfs-companion#ipfs-companion'>IFPS Companion</a> extension</li>
        </Trans>
        <Trans i18nKey='aboutIpfs.paragraph4' t={t}>
          <li className='mb2'><strong>A next-gen CDN</strong> &mdash; just add a file to your node to make it available to the world with cache-friendly content-hash addressing and BitTorrent-style bandwidth distribution</li>
        </Trans>
        <Trans i18nKey='aboutIpfs.paragraph5' t={t}>
          <li className='mb2'><strong>A developer toolset</strong> for building completely <a className='link blue' target='_blank' rel='noopener noreferrer' href='https://awesome.ipfs.io/'>distributed apps and services</a>, backed by a robust open-source community</li>
        </Trans>
      </ul>
    </Box>
  )
}

export default withTranslation('welcome')(AboutIpfs)

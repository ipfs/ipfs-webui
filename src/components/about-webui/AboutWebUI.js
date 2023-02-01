import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Box from '../box/Box.js'

export const AboutWebUI = ({ t }) => {
  return (
    <Box>
      <h2 className='mt0 mb3 montserrat fw2 f3 charcoal'>{t('welcomeInfo.header')}</h2>
      <ul className='pl3'>
        <Trans i18nKey='welcomeInfo.paragraph1' t={t}>
          <li className='mb2'><a href='#/' className='link blue u b'>Check your node status</a>, including how many peers you're connected to, your storage and bandwidth stats, and more</li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph2' t={t}>
          <li className='mb2'><a href='#/files' className='link blue u b'>View and manage files</a> in your IPFS repo, including drag-and-drop file import, easy pinning, and quick sharing and download options</li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph3' t={t}>
          <li className='mb2'><a href='#/explore' className='link blue b'>Visit the "Merkle Forest"</a> with some sample datasets and explore IPLD, the data model that underpins how IPFS works</li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph4' t={t}>
          <li className='mb2'><a href='#/peers' className='link blue b'>See who's connected to your node</a>, geolocated on a world map by their IP address</li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph5' t={t}>
          <li className='mb2'><a href='#/settings' className='link blue b'>Review or edit your node settings</a> &mdash; no command line required</li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph6' t={t}>
          <li className='f5'><a href='https://github.com/ipfs-shipyard/ipfs-webui' className='link blue b' target='_blank' rel='noopener noreferrer'>Check this app's source code</a> to <a href='https://github.com/ipfs-shipyard/ipfs-webui/issues' className='link blue' target='_blank' rel='noopener noreferrer'>report a bug</a> or make a contribution, and make IPFS better for everyone!</li>
        </Trans>
      </ul>
    </Box>
  )
}

export default withTranslation('welcome')(AboutWebUI)

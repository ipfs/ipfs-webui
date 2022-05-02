import React from 'react'
import { withTranslation, Trans } from 'react-i18next'

export const AboutWebUI = ({ t }) => {
  return (
    <div>
      <h2 className='mt0 mb3 spacegrotesk fw2 f4 white'>{t('welcomeInfo.header')}</h2>
      <ul className='pl3 f6'>
        <Trans i18nKey='welcomeInfo.paragraph1' t={t}>
          <li className='mb2 spacegrotesk white'><a href='#/' className='link purple'>Check your node status</a>, including how many peers you're connected to, your storage and bandwidth stats, and more</li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph2' t={t}>
          <li className='mb2 spacegrotesk white'><a href='#/files' className='link purple'>View and manage files</a> in your IPFS repo, including drag-and-drop file import, easy pinning, and quick sharing and download options</li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph3' t={t}>
          <li className='mb2 spacegrotesk white'>
            <button className='link purple'>
              Visit the "Merkle Forest"
            </button>
            with some sample datasets and explore IPLD, the data model that underpins how IPFS works
          </li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph4' t={t}>
          <li className='mb2 spacegrotesk white'><a href='#/peers' className='link purple'>See who's connected to your node</a>, geolocated on a world map by their IP address</li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph5' t={t}>
          <li className='mb2 spacegrotesk white'><a href='#/settings' className='link purple'>Review or edit your node settings</a> &mdash; no command line required</li>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph6' t={t}>
          <li className='mb2 spacegrotesk white'><a href='https://github.com/ipfs-shipyard/ipfs-webui' className='link purple' target='_blank' rel='noopener noreferrer'>Check this app's source code</a> to <a href='https://github.com/ipfs-shipyard/ipfs-webui/issues' className='link purple' target='_blank' rel='noopener noreferrer'>report a bug</a> or make a contribution, and make IPFS better for everyone!</li>
        </Trans>
      </ul>
    </div>
  )
}

export default withTranslation('welcome')(AboutWebUI)

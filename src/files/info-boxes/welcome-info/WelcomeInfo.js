import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import AboutIpfs from '../../../components/about-ipfs/AboutIpfs'
import Box from '../../../components/box/Box'

const WelcomeInfo = ({ t }) => (
  <div className='flex'>
    <div className='flex-auto pr3 lh-copy mid-gray'>
      <Box>
        <h1 className='mt0 mb3 montserrat fw4 f4 charcoal'>{t('welcomeInfo.header')}</h1>
        <Trans i18nKey='welcomeInfo.paragraph1'>
          <p className='f5'><a href='#/' className='link blue u b'>Check the status</a> of your node, it's Peer ID and connection info, the network traffic and the number of connected peers.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph2'>
          <p className='f5'>Easily <a href='#/files' className='link blue b'>manage files</a> in your IPFS repo. You can drag and drop to add files, move and rename them, delete, share or download them.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph3'>
          <p className='f5'>You can <a href='#/explore' className='link blue b'>explore IPLD data</a> that underpins how IPFS works.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph4'>
          <p className='f5'>See all of your <a href='#/peers' className='link blue b'>connected peers</a>, geolocated by their IP address.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph5'>
          <p className='mb4 f5'><a href='#/settings' className='link blue b'>Review the settings</a> for your IPFS node, and update them to better suit your needs.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph6'>
          <p className='mb0 f5'>If you want to help push the Web UI forward, <a href='https://github.com/ipfs-shipyard/ipfs-webui' className='link blue'>check out its code</a> or <a href='https://github.com/ipfs-shipyard/ipfs-webui/issues' className='link blue'>report a bug</a>!</p>
        </Trans>
      </Box>
    </div>
    <div className='measure lh-copy dn db-l flex-none mid-gray f6' style={{ maxWidth: '40%' }}>
      <AboutIpfs />
    </div>
  </div>
)

export default withTranslation('files')(WelcomeInfo)

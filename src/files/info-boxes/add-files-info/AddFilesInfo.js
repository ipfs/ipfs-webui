import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Box from '../../../components/box/Box.js'

const AddFilesInfo = ({ t }) => (
  <div className='mv4 tc f5' style={{ color: 'var(--theme-navbar-bg)' }}>
    <Box style={{ background: 'rgba(105, 196, 205, 0.1)' }}>
      <Trans i18nKey='addFilesInfo' t={t}>
        <p className='ma0 noselect'>No files here yet! Add files to your local IPFS node by clicking the <strong>Import</strong> button above.</p>
      </Trans>
    </Box>
  </div>
)

export default withTranslation('files')(AddFilesInfo)

import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Box from '../../../components/box/Box'

const AddFilesInfo = ({ t }) => (
  <div className='mv4 tc f5' >
    <Box>
      <Trans i18nKey='addFilesInfo' t={t}>
        <p className='ma0 w95fa f5 white'>No files here yet! Add files to your local IPFS node by clicking the <strong>Import</strong> button above.</p>
      </Trans>
    </Box>
  </div>
)

export default withTranslation('files')(AddFilesInfo)

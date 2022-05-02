import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Box from '../../../components/box/Box'

const CompanionInfo = ({ t }) => (
  <div className='mv4 tc f5' >
    <Box>
      <Trans i18nKey='companionInfo' t={t}>
        <p className='ma0 w95fa f5 white'>As you are using <strong>IPFS Companion</strong>, the files view is limited to files added while using the extension.</p>
      </Trans>
    </Box>
  </div>
)

export default withTranslation('files')(CompanionInfo)

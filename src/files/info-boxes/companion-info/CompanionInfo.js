import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Box from '../../../components/box/Box.js'

const CompanionInfo = ({ t }) => (
  <div className='mv4 tc f5' style={{ color: 'var(--theme-navbar-bg)' }}>
    <Box style={{ background: 'rgba(105, 196, 205, 0.1)' }}>
      <Trans i18nKey='companionInfo' t={t}>
        <p className='ma0'>As you are using <strong>IPFS Companion</strong>, the files view is limited to files added while using the extension.</p>
      </Trans>
    </Box>
  </div>
)

export default withTranslation('files')(CompanionInfo)

import React from 'react'
import PropTypes from 'prop-types'
import isIPFS from 'is-ipfs'
import { withTranslation } from 'react-i18next'
import Icon from '../../../icons/StrokeDecentralization'
import TextInputModal from '../../../components/text-input-modal/TextInputModal'

function ByPathModal ({ t, tReady, onCancel, onSubmit, className, ...props }) {
  const validatePath = (p) => {
    if (!p.startsWith('/ipfs/')) {
      p = `/ipfs/${p}`
    }

    return isIPFS.ipfsPath(p)
  }

  const getDescription = () => {
    const codeClass = 'w-90 mb1 pa1 bg-snow f7 charcoal-muted truncate'

    return (
      <div className='mb3 flex flex-column items-center'>
        <p className='gray w-80'>{t('addByPathModal.description')}</p>
        <span className='w-80 mv2 f7 charcoal-muted'>{t('addByPathModal.examples')}</span>
        <code className={codeClass}>/ipfs/QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V</code>
        <code className={codeClass}>QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB</code>
      </div>
    )
  }

  return (
    <TextInputModal
      validate={(p) => validatePath(p)}
      onSubmit={(p) => onSubmit(p.trim())}
      onChange={(p) => p.trimStart()}
      onCancel={onCancel}
      className={className}
      title={t('addByPathModal.title')}
      description={getDescription()}
      icon={Icon}
      submitText={t('actions.import')}
      {...props}
    />
  )
}

ByPathModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

export default withTranslation('files')(ByPathModal)

import React from 'react'
import PropTypes from 'prop-types'
import isIPFS from 'is-ipfs'
import { translate } from 'react-i18next'
import Icon from '../../icons/StrokeDecentralization'
import TextInputModal from '../../components/text-input-modal/TextInputModal'

function ByPathModal ({ t, tReady, onCancel, onSubmit, className, ...props }) {
  const validatePath = (p) => {
    if (!p.startsWith('/ipfs/')) {
      p = `/ipfs/${p}`
    }

    return isIPFS.ipfsPath(p.trim())
  }

  return (
    <TextInputModal
      validate={(p) => validatePath(p)}
      onSubmit={(p) => onSubmit(p.trim())}
      onChange={(p) => p.trimStart()}
      onCancel={onCancel}
      className={className}
      title={t('addByPathModal.title')}
      description={t('addByPathModal.description')}
      icon={Icon}
      submitText={t('actions.add')}
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

export default translate('files')(ByPathModal)

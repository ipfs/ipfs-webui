import React from 'react'
import PropTypes from 'prop-types'
import Icon from '../../../icons/StrokeSpeaker.js'
import TextInputModal from '../../text-input-modal/TextInputModal.js'

const GenerateKeyModal = ({ t, tReady, onCancel, onSubmit, className, ...props }) => {
  return (
    <TextInputModal
      onSubmit={(p) => onSubmit(p.trim())}
      onChange={(p) => p.trimStart()}
      onCancel={onCancel}
      className={className}
      title={t('generateKeyModal.title')}
      description={t('generateKeyModal.description')}
      Icon={Icon}
      submitText={t('app:actions.generate')}
      {...props}
    />
  )
}

GenerateKeyModal.propTypes = {
  t: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  className: PropTypes.string
}

GenerateKeyModal.defaultProps = {
  className: ''
}

export default GenerateKeyModal

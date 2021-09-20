import React from 'react'
import PropTypes from 'prop-types'
import Icon from '../../../icons/StrokePencil'
import TextInputModal from '../../text-input-modal/TextInputModal'

const RenameKeyModal = ({ t, tReady, name, onCancel, onSubmit, className, ...props }) => {
  return (
    <TextInputModal
      onSubmit={(p) => onSubmit(p.trim())}
      onChange={(p) => p.trimStart()}
      onCancel={onCancel}
      className={className}
      title={t('renameKeyModal.title')}
      description={t('renameKeyModal.description')}
      Icon={Icon}
      defaultValue={name}
      mustBeDifferent={true}
      submitText={t('app:actions.rename')}
      {...props}
    />
  )
}

RenameKeyModal.propTypes = {
  t: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  className: PropTypes.string
}

RenameKeyModal.defaultProps = {
  className: ''
}

export default RenameKeyModal

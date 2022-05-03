import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import TrashIcon from '../../../icons/StrokeTrash'
import DeleteFileIcon from '../../../icons/retro/files/DeleteFileIcon'
import Checkbox from '../../../components/checkbox/Checkbox'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'
import { connect } from 'redux-bundler-react'
import FullGradientButton from '../../../components/common/atoms/FullGradientButton'
import RetroGradientButton from '../../../components/common/atoms/RetroGradientButton'
import RetroText from '../../../components/common/atoms/RetroText'
import { StyledIconContainer, StyledModalTitle } from '../new-folder-modal/NewFolderModal'

const RemoveModal = ({ t, tReady, onCancel, onRemove, files, foldersCount, filesCount, remotePins, pinningServices, className, ...props }) => {
  let context = 'File'
  const count = filesCount + foldersCount

  if (foldersCount > 0) {
    if (filesCount > 0) {
      context = 'Item'
    } else {
      context = 'Folder'
    }
  }

  const isLocallyPinned = files.some(f => f.pinned)
  const [isRemotelyPinned, setRemotelyPinned] = useState(false)

  const [shouldRemoveLocalPin, setShouldRemoveLocalPin] = useState(isLocallyPinned)
  const [shouldRemoveRemotePin, setShouldRemoveRemotePin] = useState(false)

  useEffect(() => {
    (async () => {
      const isPinned = files.some(f => remotePins.find(p => p.cid.string === f.cid.string))
      setRemotelyPinned(isPinned)
    })()
  })

  const modalData = { count, name: '' }

  const modalTitle = t(`removeModal.title${context}`, modalData)
  const modalDescription = t(`removeModal.description${context}`, modalData)
  const handleLocalPinRemoval = () => setShouldRemoveLocalPin(!shouldRemoveLocalPin)
  const handleRemotePinRemoval = () => setShouldRemoveRemotePin(!shouldRemoveRemotePin)

  const handleRemove = () => onRemove({ removeLocally: shouldRemoveLocalPin, removeRemotely: shouldRemoveRemotePin, remoteServices: pinningServices.map(s => s.name) })

  return (
    <Modal {...props} className={className + ' generic-modal spacegrotesk'} onCancel={onCancel} >
      <ModalBody
        title={
          <StyledModalTitle>
            <StyledIconContainer>
              <DeleteFileIcon />
            </StyledIconContainer>
            {modalTitle}
            <span className='fs14 purple ml2'>{files[0].name}</span>
          </StyledModalTitle>}
        Icon={TrashIcon}
        className='textinputmodal-body white spacegrotesk'
      >
        <div className='w-100 center w95fa'>
          {/* {files.length === 1 && (<p className='spacegrotesk purple' style={{ fontSize: '12px' }}>{files[0].cid.string}</p>)} */}
          <p className='f6 ma0 mb3 gray spacegrotesk'>{modalDescription}</p>
          {isLocallyPinned && (
            <Checkbox className="w95fa justify-start mb2 spacegrotesk f6" checked={shouldRemoveLocalPin} onChange={handleLocalPinRemoval} label={t('removeModal.checkboxRemoveLocalPin')} color='black' />
          )}
          {isRemotelyPinned && (
            <Checkbox className="w95fa justify-start mb2 spacegrotesk f6" checked={shouldRemoveRemotePin} onChange={handleRemotePinRemoval} label={t('removeModal.checkboxUnpinFromServices')} color='black' />
          )}
        </div>
      </ModalBody>

      <ModalActions justify='between mt4'>
        <RetroGradientButton width='calc((100% - 40px) / 2)' height={'38px'} onClick={onCancel}>
          <RetroText color='white' className='tc spacegrotesk'>
            {t('app:actions.cancel')}
          </RetroText>
        </RetroGradientButton>
        <FullGradientButton width='calc((100% - 40px) / 2)' height={'38px'} onClick={handleRemove}>
          <RetroText color='white' className='tc spacegrotesk'>
            {t('app:actions.remove')}
          </RetroText>
        </FullGradientButton>
      </ModalActions>
    </Modal>
  )
}

RemoveModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  filesCount: PropTypes.number,
  foldersCount: PropTypes.number,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

RemoveModal.defaultProps = {
  className: '',
  filesCount: 0,
  foldersCount: 0
}

export default connect(
  'selectRemotePins',
  'selectPinningServices',
  withTranslation('files')(RemoveModal)
)

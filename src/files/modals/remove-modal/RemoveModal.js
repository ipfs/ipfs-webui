import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import TrashIcon from '../../../icons/StrokeTrash.js'
import Button from '../../../components/button/Button.js'
import Checkbox from '../../../components/checkbox/Checkbox.js'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal.js'
import { connect } from 'redux-bundler-react'

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
      const isPinned = files.some(f => remotePins.find(p => p.endsWith(f.cid.toString())))
      setRemotelyPinned(isPinned)
    })()
  })

  const modalData = { count, name: files[0].name }
  const modalTitle = t(`removeModal.title${context}`, modalData)
  const modalDescription = t(`removeModal.description${context}`, modalData)

  const handleLocalPinRemoval = () => setShouldRemoveLocalPin(!shouldRemoveLocalPin)
  const handleRemotePinRemoval = () => setShouldRemoveRemotePin(!shouldRemoveRemotePin)

  const handleRemove = () => onRemove({ removeLocally: shouldRemoveLocalPin, removeRemotely: shouldRemoveRemotePin, remoteServices: pinningServices.map(s => s.name) })

  return (
    <Modal {...props} className={className} onCancel={onCancel} >
      <ModalBody title={modalTitle} Icon={TrashIcon}>
        <div className='charcoal w-100 center tl'>
          <p>{modalDescription}</p>
          { isLocallyPinned && (<div>
            <Checkbox className="mr1" checked={shouldRemoveLocalPin} onChange={handleLocalPinRemoval} label={t('removeModal.checkboxRemoveLocalPin')}/>
          </div>
          )}
          { isRemotelyPinned && (<div className='mt1'>
            <Checkbox className="mr1" checked={shouldRemoveRemotePin} onChange={handleRemotePinRemoval} label={t('removeModal.checkboxUnpinFromServices')}/>
          </div>
          )}
        </div>
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('app:actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-red' onClick={handleRemove}>{t('app:actions.remove')}</Button>
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

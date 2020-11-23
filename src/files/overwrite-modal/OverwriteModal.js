import React from 'react'
import PropTypes from 'prop-types'
import StrokeAttention from '../../icons/StrokeAttention'
import Button from '../../components/button/Button'
import Overlay from '../../components/overlay/Overlay'
import { Modal, ModalActions, ModalBody } from '../../components/modal/Modal'
import { Trans, withTranslation } from 'react-i18next'

const OverwriteModal = ({ t, tReady, existingFiles, onAddFiles, onCancel, ...props }) => {
  if (!existingFiles?.length) {
    return null
  }

  const onAppend = (file) => {
    onAddFiles([{
      ...file,
      appendCID: true
    }])

    onCancel(file)
  }

  const onOverwrite = (file) => {
    onAddFiles([file])
    onCancel(file)
  }

  return (<>
    { existingFiles.map((file, index) => (
      <Overlay show={true} onLeave={onCancel} key={index}>
        <Modal {...props} onCancel={onCancel} >
          <ModalBody title={t('overwriteModal.title')} Icon={StrokeAttention}>
            <p className='gray w-80 center'>
              <Trans key='overwriteModal.description'>
            The destination directory already contains an item named <b>{file.path}</b>, but with a different CID. Do you want to overwrite the item in the destination directory, or rename the item you're moving by appending the last 4 characters of its CID to its name?
              </Trans>
            </p>
          </ModalBody>

          <ModalActions>
            <Button minWidth={0} className='ma2 pa2 tc' bg='bg-gray' onClick={onCancel}>{t('app:actions.cancel')}</Button>
            <div className="flex items-center">
              <Button minWidth={0} className='ma2 pa2 tc' onClick={() => onAppend(file)}>{t('app:actions.append')}</Button>
              <Button minWidth={0} className='ma2 pa2 tc' onClick={() => onOverwrite(file)} danger>{t('app:actions.overwrite')}</Button>
            </div>
          </ModalActions>
        </Modal>
      </Overlay>
    ))}
  </>
  )
}

OverwriteModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  link: PropTypes.string,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool
}

OverwriteModal.defaultProps = {
  className: ''
}

export default withTranslation('files')(OverwriteModal)

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import Button from '../../../components/button/Button'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'
import { connect } from 'redux-bundler-react'
import Radio from '../../../components/radio/Radio'
import './PublishModal.css'

const PublishModal = ({ t, tReady, onCancel, onSubmit, file, ipnsKeys, className, doFetchIpnsKeys, ...props }) => {
  const [selectedKey, setSelectedKey] = useState('')

  const handlePublish = () => {
    onSubmit(selectedKey)
  }

  useEffect(() => {
    doFetchIpnsKeys()
  }, [doFetchIpnsKeys])

  return (
    <Modal {...props} className={className} onCancel={onCancel} >
      <ModalBody title={t('publishModal.title')}>
        <p>{t('publishModal.toPublish')} <span className='f6 monospace'>{file.cid.toString()}</span></p>

        <div className="publishModalKeys">
          { ipnsKeys.map(({ name }) => (
            <button className="flex items-center pa1 hoverable-button" key={name} onClick={() => setSelectedKey(name)}>
              <Radio className='pv3 pl3 pr1 flex-none' checked={name === selectedKey} label={name} style={{ pointerEvents: 'none' }} />
            </button>
          ))}
        </div>
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('app:actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-teal' disabled={selectedKey === ''} onClick={handlePublish}>{t('app:actions.publish')}</Button>
      </ModalActions>
    </Modal>
  )
}

PublishModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  file: PropTypes.object,
  tReady: PropTypes.bool
}

PublishModal.defaultProps = {
  className: ''
}

export default connect(
  'selectIpnsKeys',
  'doFetchIpnsKeys',
  withTranslation('files')(PublishModal)
)

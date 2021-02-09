import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { /* Trans, */ withTranslation } from 'react-i18next'
import filesize from 'filesize'
import Button from '../../../components/button/Button'
import Checkbox from '../../../components/checkbox/Checkbox'
import GlyphPin from '../../../icons/GlyphPin'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'
import { connect } from 'redux-bundler-react'
import './PinningModal.css'

const humanSize = (size) => {
  if (!size) return 'N/A'

  return filesize(size || 0, {
    round: size >= 1000000000 ? 1 : 0, spacer: ''
  })
}

export const PinningModal = ({ t, tReady, onCancel, onPinningSet, file, availablePinningServices, doGetFileSizeThroughCid, doSelectRemotePinsForFile, doFetchPinningServices, className, ...props }) => {
  const remoteServices = useMemo(() => doSelectRemotePinsForFile(file), [doSelectRemotePinsForFile, file])

  const [selectedServices, setSelectedServices] = useState([...remoteServices, ...[file.pinned && 'local']])
  const [size, setSize] = useState(null)

  useEffect(() => {
    doFetchPinningServices()
    const fetchSize = async () => setSize(await doGetFileSizeThroughCid(file.cid))
    fetchSize()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectService = (key) => {
    if (selectedServices.indexOf(key) === -1) {
      return setSelectedServices([...selectedServices, key])
    }

    return setSelectedServices(selectedServices.filter(s => s !== key))
  }
  return (
    <Modal {...props} className={className} onCancel={onCancel} >
      <ModalBody title={t('pinningModal.title')}>
        <div className="pinningModalContainer">
          <button className="flex items-center pa1 hoverable-button" key={t('pinningModal.localNode')} onClick={() => selectService('local')}>
            <Checkbox className='pv3 pl3 pr1 flex-none' checked={selectedServices.includes('local')} style={{ pointerEvents: 'none' }}/>
            <GlyphPin fill="currentColor" width={32} height={32} className="mr1 aqua flex-shrink-0"/>
            <p className="f5 w-100">{ t('pinningModal.localNode') }</p>
          </button>
          { availablePinningServices.map(({ icon, name }) => (
            <button className="flex items-center pa1 hoverable-button" key={name} onClick={() => selectService(name)}>
              <Checkbox className='pv3 pl3 pr1 flex-none' checked={selectedServices.includes(name)} style={{ pointerEvents: 'none' }}/>
              <img className="mr1" src={icon} alt='' width={32} height={32} style={{ objectFit: 'contain' }} />
              <p className="f5">{ name }</p>
            </button>
          ))}
        </div>
        {/* <p className='mh0 mt3 mb1 f6'>
          <Trans i18nKey='pinningModal.footer' t={t}>
            Need to add or configure a pinning service? Go to <a href="#/settings" className="link blue">Settings.</a>
          </Trans>
        </p> */}
        <p className="f6 charcoal">{t('pinningModal.totalSize', { size: humanSize(size) })}</p>
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('app:actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-teal' onClick={() => onPinningSet(file, selectedServices)}>{t('app:actions.apply')}</Button>
      </ModalActions>
    </Modal>
  )
}

PinningModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onPinningSet: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  file: PropTypes.object,
  tReady: PropTypes.bool
}

PinningModal.defaultProps = {
  className: ''
}

export default connect(
  'selectAvailablePinningServices',
  'doSelectRemotePinsForFile',
  'doGetFileSizeThroughCid',
  'doFetchPinningServices',
  withTranslation('files')(PinningModal)
)

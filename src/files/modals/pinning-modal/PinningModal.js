import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { /* Trans, */ withTranslation } from 'react-i18next'
import { humanSize } from '../../../lib/files'
import Checkbox from '../../../components/checkbox/Checkbox'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'
import { connect } from 'redux-bundler-react'
import './PinningModal.css'
import { StyledModalTitle, StyledIconContainer } from '../new-folder-modal/NewFolderModal'
import PinnedIcon from '../../../icons/retro/PinIcon'
// import RetroButton from '../../../components/common/atoms/RetroButton'
import RetroText from '../../../components/common/atoms/RetroText'
import RetroGradientButton from '../../../components/common/atoms/RetroGradientButton'
import FullGradientButton from '../../../components/common/atoms/FullGradientButton'
import FilePinIcon from '../../../icons/retro/files/FilepinIcon'

const PinIcon = ({ icon }) => {
  if (icon) {
    return <img className="mr1" src={icon} alt='' width={32} height={32} style={{ objectFit: 'contain' }} />
  }

  return <PinnedIcon />
}

export const PinningModal = ({ t, tReady, onCancel, onPinningSet, file, pinningServices, doGetFileSizeThroughCid, doSelectRemotePinsForFile, doFetchPinningServices, className, ...props }) => {
  const selectedRemoteServices = useMemo(() => doSelectRemotePinsForFile(file), [doSelectRemotePinsForFile, file])
  const [selectedServices, setSelectedServices] = useState([...selectedRemoteServices, ...[file.pinned && 'local']])
  const [size, setSize] = useState(null)

  useEffect(() => {
    doFetchPinningServices()
    const fetchSize = async () => setSize(await doGetFileSizeThroughCid(file.cid))
    fetchSize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectService = (key) => {
    const service = pinningServices.find(s => s.name === key)
    if (service && !service.online) {
      // when a service is offline, click in noop
      return
    }
    if (selectedServices.indexOf(key) === -1) {
      return setSelectedServices([...selectedServices, key])
    }

    return setSelectedServices(selectedServices.filter(s => s !== key))
  }

  return (
    <Modal {...props} className={className + ' generic-modal spacegrotesk'} onCancel={onCancel} style={{ maxWidth: '20em' }} >
      <ModalBody title={
        <StyledModalTitle>
          <StyledIconContainer>
            <FilePinIcon color='white' width='25px' height='25px'/>
          </StyledIconContainer>
          {t('pinningModal.title')}
        </StyledModalTitle>
      } className='textinputmodal-body white spacegrotesk gray pb2'>
        <div className="pinningModalContainer">
          <button className="flex items-center pa1 hoverable-button" key={t('pinningModal.localNode')} onClick={() => selectService('local')}>
            <Checkbox color='black' className='pv3 pl3 flex-none spacegrotesk' checked={selectedServices.includes('local')} style={{ pointerEvents: 'none' }} />
            <PinnedIcon color='white' />
            <p className="f5 w-100 pl1 spacegrotesk">{t('pinningModal.localNode')}</p>
          </button>
          {pinningServices.map(({ icon, name, online }, index) => (
            <button className="flex items-center pa1 hoverable-button" key={name} onClick={() => selectService(name)}>
              <Checkbox className='pv3 pl3 pr1 flex-none' checked={selectedServices.includes(name)} style={{ pointerEvents: 'none' }} disabled={!online} />
              <PinIcon index={index} icon={icon} />
              <p className={'spacegrotesk f5 w-100' + (online ? 'f5' : 'f5 red')}>{name}</p>
            </button>
          ))}
        </div>
        <p className="f6 spacegrotesk pl3">{t('pinningModal.totalSize', { size: humanSize(size) })}</p>
      </ModalBody>

      <ModalActions justify='between' className='ph3'>
        <RetroGradientButton width='calc((100% - 40px) / 2)' onClick={onCancel} height={'38px'}>
          <RetroText className="f6 spacegrotesk white tc">
            {t('app:actions.cancel')}
          </RetroText>
        </RetroGradientButton>
        <FullGradientButton width='calc((100% - 40px) / 2)' onClick={() => onPinningSet(file, selectedServices, file.pinned, selectedRemoteServices)} height={'38px'}>
          <RetroText className="f6 spacegrotesk white tc">
            {t('app:actions.apply')}
          </RetroText>
        </FullGradientButton>
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
  'selectPinningServices',
  'doSelectRemotePinsForFile',
  'doGetFileSizeThroughCid',
  'doFetchPinningServices',
  withTranslation('files')(PinningModal)
)

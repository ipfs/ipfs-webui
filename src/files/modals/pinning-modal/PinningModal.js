import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { /* Trans, */ withTranslation } from 'react-i18next'
import { humanSize } from '../../../lib/files.js'
import Button from '../../../components/button/Button.js'
import Checkbox from '../../../components/checkbox/Checkbox.js'
import GlyphPin from '../../../icons/GlyphPin.js'
import Icon from '../../../icons/StrokePinCloud.js'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal.js'
import { complianceReportsHomepage } from '../../../constants/pinning.js'
import { connect } from 'redux-bundler-react'
import './PinningModal.css'

const PinIcon = ({ icon, index }) => {
  if (icon) {
    return <img className="mr1" src={icon} alt='' width={32} height={32} style={{ objectFit: 'contain' }} />
  }

  const colors = ['aqua', 'link', 'yellow', 'teal', 'red', 'green', 'navy', 'gray', 'charcoal']
  const color = colors[index % colors.length]
  const glyphClass = `mr1 fill-${color} flex-shrink-0`

  return <GlyphPin width={32} height={32} className={glyphClass}/>
}

export const PinningModal = ({ t, tReady, onCancel, onPinningSet, file, pinningServices, remotePins, notRemotePins, pendingPins, doGetFileSizeThroughCid, doSelectRemotePinsForFile, doFetchPinningServices, doFetchRemotePins, className, ...props }) => {
  const selectedRemoteServices = useMemo(() => doSelectRemotePinsForFile(file, remotePins, notRemotePins, pendingPins), [doSelectRemotePinsForFile, file, remotePins, notRemotePins, pendingPins])
  const [selectedServices, setSelectedServices] = useState([...selectedRemoteServices, ...[file.pinned && 'local']])
  const [size, setSize] = useState(null)

  useEffect(() => {
    doFetchPinningServices()
    const fetchSize = async () => setSize(await doGetFileSizeThroughCid(file.cid))
    fetchSize()
    doFetchRemotePins([{ cid: file.cid }])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  useEffect(() => {
    // Trigger status check for services without cached result
    setSelectedServices([...selectedRemoteServices, ...[file.pinned && 'local']])
  }, [file, selectedRemoteServices])

  const selectService = (key) => {
    if (selectedServices.indexOf(key) === -1) {
      return setSelectedServices([...selectedServices, key])
    }

    return setSelectedServices(selectedServices.filter(s => s !== key))
  }

  return (
    <Modal {...props} className={className} onCancel={onCancel} >
      <ModalBody title={t('pinningModal.title')} Icon={Icon}>
        <div className="pinningModalContainer">
          <button className="flex items-center pa1 hoverable-button" key={t('pinningModal.localNode')} onClick={() => selectService('local')}>
            <Checkbox className='pv3 pl3 pr1 flex-none' checked={selectedServices.includes('local')} style={{ pointerEvents: 'none' }}/>
            <GlyphPin fill="currentColor" width={32} height={32} className="mr1 aqua flex-shrink-0"/>
            <p className="f5 w-100">{ t('pinningModal.localNode') }</p>
          </button>
          { pinningServices.map(({ icon, name }, index) => (
            <button className="flex items-center pa1 hoverable-button" key={name} onClick={() => selectService(name)}>
              <Checkbox className='pv3 pl3 pr1 flex-none' checked={selectedServices.includes(name)} style={{ pointerEvents: 'none' }}/>
              <PinIcon index={index} icon={icon}/>
              <p className='f5'>{ name }</p>
            </button>
          ))}
        </div>
        {/* <p className='mh0 mt3 mb1 f6'>
          <Trans i18nKey='pinningModal.footer' t={t}>
            Need to add or configure a pinning service? Go to <a href="#/settings" className="link blue">Settings.</a>
          </Trans>
        </p> */}
        <a className="mb1 tl f7 charcoal-muted no-underline underline-hover" target="_blank" rel="noreferrer" href={complianceReportsHomepage}>{ t('pinningModal.complianceLabel') }</a>
        <p className="f6 charcoal">{t('pinningModal.totalSize', { size: humanSize(size) })}</p>
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('app:actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-teal' onClick={() => onPinningSet(file, selectedServices, file.pinned, selectedRemoteServices)}>{t('app:actions.apply')}</Button>
      </ModalActions>
    </Modal>
  )
}

PinningModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onPinningSet: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  file: PropTypes.object.isRequired
}

PinningModal.defaultProps = {
  className: ''
}

export default connect(
  'selectPinningServices',
  'selectRemotePins',
  'selectPendingPins',
  'selectNotRemotePins',
  'doSelectRemotePinsForFile',
  'doGetFileSizeThroughCid',
  'doFetchPinningServices',
  'doFetchRemotePins',
  withTranslation('files')(PinningModal)
)

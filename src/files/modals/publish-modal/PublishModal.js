import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Button from '../../../components/button/Button'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'
import Icon from '../../../icons/StrokeSpeaker'
import { connect } from 'redux-bundler-react'
import Radio from '../../../components/radio/Radio'
import './PublishModal.css'

const PublishModal = ({ t, tReady, onLeave, onSubmit, file, ipnsKeys, publicGateway, className, doFetchIpnsKeys, ...props }) => {
  const [disabled, setDisabled] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const [selectedKey, setSelectedKey] = useState({ name: '', id: '' })
  const [link, setLink] = useState('')

  useEffect(() => {
    setDisabled(selectedKey.name === '' || pending)
  }, [selectedKey, pending])

  useEffect(() => {
    doFetchIpnsKeys()
  }, [doFetchIpnsKeys])

  const changeKey = (key) => {
    setLink('')
    setError(null)
    setSelectedKey(key)
  }

  const publish = async () => {
    try {
      setPending(true)
      await onSubmit(selectedKey.name)
      setLink(`${publicGateway}/ipns/${selectedKey.id}`)
    } catch (err) {
      setError(err)
    } finally {
      setPending(false)
    }
  }

  const modalBody = () => {
    if (link) {
      return (
        <div>
          <div className='tl pv3'>{t('publishModal.publishedUnderKey')}<br/>
            <span className='f6 charcoal-muted monospace'>{selectedKey.name}</span><br/>
            <span className='f6 charcoal-muted monospace'>{selectedKey.id}</span>
          </div>
          <p className='charcoal tl center'>{t('publishModal.sharingPrompt')}</p>
          <div className='flex center pb2'>
            <input
              value={link}
              readOnly
              className={'input-reset flex-grow-1 charcoal-muted ba b--black-20 br1 pa2 mr2 focus-outline'}
              type='text' />
          </div>
        </div>
      )
    }

    return (
      <div>
        <div className='tl pv3'>{t('publishModal.publishUnderKey')}</div>
        <div className="publishModalKeys">
          { ipnsKeys.map((key) => (
            <button className="flex items-center pa1 hoverable-button" key={key.name} onClick={() => changeKey(key)}>
              <Radio className='pv3 pl3 pr1 flex-none' checked={key.name === selectedKey.name} label={key.name} style={{ pointerEvents: 'none' }} />
            </button>
          ))}
        </div>

        { error && <p className='ma0 lh-copy red f5 mw7'>{error.toString()}</p>}
      </div>
    )
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} >
      <ModalBody Icon={Icon} title={t('publishModal.title')}>
        <div className='tl pv3'>{t('publishModal.cidToPublish')}<br/><span className='f6 charcoal-muted monospace'>{file.cid.toString()}</span></div>
        {modalBody()}
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('app:actions.cancel')}</Button>

        { link
          ? <CopyToClipboard text={link} onCopy={onLeave}>
            <Button className='ma2 tc'>{t('app:actions.copy')}</Button>
          </CopyToClipboard>
          : <Button className='ma2 tc' bg='bg-teal' disabled={disabled} onClick={publish}>{
            pending ? 'TODO:SPINNER' : t('app:actions.publish')
          }</Button>
        }

      </ModalActions>
    </Modal>
  )
}

PublishModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
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
  'selectPublicGateway',
  'doFetchIpnsKeys',
  withTranslation('files')(PublishModal)
)

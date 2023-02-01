import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Button from '../../../components/button/Button.js'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal.js'
import Icon from '../../../icons/StrokeSpeaker.js'
import { connect } from 'redux-bundler-react'
import Radio from '../../../components/radio/Radio.js'
import ProgressBar from '../../../components/progress-bar/ProgressBar.js'
import GlyphCopy from '../../../icons/GlyphCopy.js'
import GlyphTick from '../../../icons/GlyphTick.js'
import './PublishModal.css'

export const PublishModal = ({ t, tReady, onLeave, onSubmit, file, ipnsKeys, publicGateway, className, doFetchIpnsKeys, doUpdateExpectedPublishTime, expectedPublishTime, ...props }) => {
  const [disabled, setDisabled] = useState(true)
  const [error, setError] = useState(null)
  const [selectedKey, setSelectedKey] = useState({ name: '', id: '' })
  const [link, setLink] = useState('')
  const [start, setStart] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setDisabled(selectedKey.name === '' || start !== null)
  }, [selectedKey, start])

  useEffect(() => {
    doFetchIpnsKeys()
  }, [doFetchIpnsKeys])

  useEffect(() => {
    if (copied) {
      const timeoutId = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [copied])

  const changeKey = (key) => {
    setLink('')
    setError(null)
    setSelectedKey(key)
  }

  const publish = async () => {
    try {
      const startTs = new Date().getTime()
      setStart(startTs)

      await onSubmit(selectedKey.name)
      setLink(`${publicGateway}/ipns/${selectedKey.id}`)

      // Update the expected time with the new timing.
      const endTs = new Date().getTime()
      doUpdateExpectedPublishTime((endTs - startTs) / 1000)
    } catch (err) {
      setError(err)
    }
  }

  const modalBody = () => {
    if (link) {
      return (
        <div>
          <div className='tl pv3'>{t('publishModal.publishedUnderKey')}
            <div className='f6 mv2 charcoal-muted monospace'>
              <a target='_blank' rel='noopener noreferrer' className='link' href={link}>{selectedKey.name}</a>
            </div>
            <div className='f6 charcoal-muted monospace truncate'>
              <a target='_blank' rel='noopener noreferrer' className='link' href={link}>{selectedKey.id}</a>
            </div>
          </div>
          <p className='charcoal tl center'>{t('publishModal.sharingPrompt')}</p>
          <div className='flex center mb2 relative'>
            <input
              value={link}
              readOnly
              className={'input-reset flex-grow-1 charcoal-muted ba b--black-20 br1 pa2 focus-outline'}
              style={{ color: `rgba(128, 133, 145, ${copied ? 0.6 : 1})` }}
              type='text' />

            <div className='absolute h2 pl2 flex items-center' style={{ right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.35), #ffffff 10%, #ffffff 100%)' }} >
              { copied
                ? <>
                  <span className="charcoal-muted strong f5">{t('publishModal.linkCopied')}</span>
                  <GlyphTick className='fill-aqua w2' />
                </>
                : <CopyToClipboard text={link} onCopy={() => setCopied(true)}>
                  <GlyphCopy className='fill-charcoal-muted w2 h2 pointer' />
                </CopyToClipboard>
              }
            </div>
          </div>
        </div>
      )
    }

    if (start) {
      return (
        <div>
          <p className='charcoal tl center'>{t('publishModal.pleaseWait')}</p>
          <ProgressBar bg='bg-teal' style={{ height: '8px' }} time={expectedPublishTime} />
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
        <span className="mb1 tl f7 charcoal-muted">{ t('publishModal.help') }</span>

        { error && <p className='ma0 lh-copy red f5 mw7'>{error.toString()}</p>}
      </div>
    )
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} >
      <ModalBody Icon={Icon} title={t('publishModal.title')}>
        <div className='tl pv3'>
          {t('publishModal.cidToPublish')}
          <div className='f6 mt1 charcoal-muted monospace'>{file.cid.toString()}</div>
        </div>
        {modalBody()}
      </ModalBody>

      <ModalActions>
        { link
          ? <Button className='ma2 tc ml-auto' onClick={onLeave}>{t('app:actions.done')}</Button>
          : <>
            <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('app:actions.cancel')}</Button>
            <Button className='ma2 tc' bg='bg-teal' disabled={disabled} onClick={publish}>{t('app:actions.publish')}</Button>
          </>
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
  'selectExpectedPublishTime',
  'selectPublicGateway',
  'doFetchIpnsKeys',
  'doUpdateExpectedPublishTime',
  withTranslation('files')(PublishModal)
)

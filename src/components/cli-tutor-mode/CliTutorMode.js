import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'

// Components
import { Modal, ModalBody, ModalActions } from '../modal/Modal.js'
import StrokeCode from '../../icons/StrokeCode.js'
import Button from '../button/Button.js'
import Overlay from '../overlay/Overlay.js'
import Shell from '../shell/Shell.js'
import StrokeDownload from '../../icons/StrokeDownload.js'
import { cliCmdKeys, cliCommandList, cliCmdPrefixes } from '../../bundles/files/consts.js'

export const CliTutorialModal = ({ command, t, onLeave, className, downloadConfig, ...props }) => {
  const onClickCopyToClipboard = (cmd) => {
    navigator.clipboard.writeText(cmd).then(() => {
      onLeave()
    })
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '40em' }}>
      <ModalBody Icon={StrokeCode}>
        <p className='charcoal w-80 center' style={{ lineHeight: '1.3' }}>
          {t('app:cliModal.description')}
        </p>
        <p className='charcoal-muted w-90 center'>
          { command && command === cliCommandList[cliCmdKeys.UPDATE_IPFS_CONFIG]() ? t('settings:cliModal.extraNotesJsonConfig') : ''}
          { command && command.startsWith(cliCmdPrefixes.PIN_OBJECT) ? t('files:cliModal.extraNotesPinning') : ''}
        </p>
        <div>
          <Shell className='tl' title="Shell">
            <code className='db'><b className='no-select'>$ </b>{command}</code>
          </Shell>
        </div>
      </ModalBody>

      <ModalActions>
        <div>
          <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('app:actions.close')}</Button>
        </div>
        <div className='flex items-center'>
          {
            command && command === cliCommandList[cliCmdKeys.UPDATE_IPFS_CONFIG]()
              ? <StrokeDownload onClick={downloadConfig} className='dib fill-link pointer' style={{ height: 38 }}
              />
              : <div />
          }
          <Button className='ma2 tc' onClick={() => onClickCopyToClipboard(command)}>
            {t('app:actions.copy')}
          </Button>
        </div>
      </ModalActions>
    </Modal>
  )
}

const CliTutorMode = ({
  t, filesPage, isCliTutorModeEnabled, onLeave, isCliTutorModalOpen, command, config, showIcon, doOpenCliTutorModal
}) => {
  const downloadConfig = (config) => {
    const url = window.URL.createObjectURL(new Blob([config]))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.download = 'settings.json'
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (isCliTutorModeEnabled) {
    if (filesPage) {
      return <CliTutorialModal className='outline-0' onLeave={onLeave} t={t} command={command}/>
    }
    return (
      <Fragment>
        {
          showIcon
            ? <StrokeCode onClick={() => doOpenCliTutorModal(true)} className='dib fill-link pointer mh2' style={{ height: 44 }}/>
            : <div/>
        }
        <Overlay show={isCliTutorModalOpen} onLeave={() => doOpenCliTutorModal(false)}>
          <CliTutorialModal className='outline-0' onLeave={() => doOpenCliTutorModal(false)} t={t} command={command}
            downloadConfig={() => downloadConfig(config)}/>
        </Overlay>
      </Fragment>
    )
  }

  return null
}

CliTutorialModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  command: PropTypes.string.isRequired
}

CliTutorialModal.defaultProps = {
  className: ''
}

export default connect(
  'doOpenCliTutorModal',
  'selectIsCliTutorModalOpen',
  'selectIsCliTutorModeEnabled',
  CliTutorMode
)

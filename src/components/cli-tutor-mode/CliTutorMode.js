import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'

// Components
import { Modal, ModalBody, ModalActions } from '../modal/Modal'
import CopyIcon from '../../icons/CopyIcon'
import Button from '../button/Button'
import Overlay from '../overlay/Overlay'
import Shell from '../shell/Shell'
import StrokeDownload from '../../icons/StrokeDownload'

const CliTutorialModal = ({ command, t, onLeave, className, downloadConfig, ...props }) => {
  const onClickCopyToClipboard = async (command) => {
    await navigator.clipboard.writeText(command)
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '40em' }}>
      <ModalBody icon={CopyIcon}>
        <p className='charcoal w-80 center'>{t('Copy the following and paste it into your terminal application to do this task in IPFS via the command line.')}</p>
        <div>
          <Shell title="terminal shell">
            <code className='db'><b className='no-select'>$ </b>{command}</code>
          </Shell>
        </div>
      </ModalBody>

      <ModalActions>
        <div>
          <Button className='ma2' bg='bg-gray' onClick={onLeave}>{t('actions.close')}</Button>
        </div>
        <div className='flex items-center'>
          {
            command && command.includes('ipfs config replace')
              ? <span onClick={downloadConfig}>
                <StrokeDownload
                  style={{ height: '28px', transform: 'scale(1.5)', verticalAlign: 'bottom', color: 'dodgerblue' }}
                  className='dib fill-current-color ph2 glow o-80 pointer'
                />
              </span> : <div />
          }
          <Button
            className='mt2 mt0-l ml2-l pointer'
            onClick={() => onClickCopyToClipboard(command)}>
            {t('actions.copyCommand')}
          </Button>
        </div>
      </ModalActions>
    </Modal>
  )
}

class CliTutorMode extends Component {
  downloadConfig = (config) => {
    const url = window.URL.createObjectURL(new Blob([config]))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.download = 'settings.json'
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
  }

  render () {
    const { t, filesPage, isCliTutorModeEnabled, onLeave, isCliTutorModalOpen, command, config, showIcon, doOpenCliTutorModal } = this.props
    if (isCliTutorModeEnabled) {
      if (filesPage) {
        return <CliTutorialModal className='outline-0' onLeave={onLeave} t={t} command={command}
          downloadConfig={() => this.downloadConfig(config)}/>
      }
      return (
        <Fragment>
          {
            showIcon ? <CopyIcon
              onClick={doOpenCliTutorModal}
              className='dib fill-current-color ph2 glow o-80 pointer'
              style={{ height: '28px', transform: 'scale(1.5)', verticalAlign: 'bottom', color: 'dodgerblue' }}
            /> : null
          }
          <Overlay show={isCliTutorModalOpen} onLeave={doOpenCliTutorModal}>
            <CliTutorialModal className='outline-0' onLeave={() => doOpenCliTutorModal(false)} t={t} command={command}
              downloadConfig={() => this.downloadConfig(config)}/>
          </Overlay>
        </Fragment>
      )
    }

    return <div/>
  }
}

CliTutorialModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool
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

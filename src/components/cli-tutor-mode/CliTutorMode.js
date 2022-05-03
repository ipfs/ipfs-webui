import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'

// Components
import { Modal, ModalBody, ModalActions } from '../modal/Modal'
import Overlay from '../overlay/Overlay'
import Shell from '../shell/Shell'
import { cliCmdKeys, cliCommandList, cliCmdPrefixes } from '../../bundles/files/consts'

// import RetroButton from '../common/atoms/RetroButton'
import RetroText from '../common/atoms/RetroText'
import CLITutorIcon from '../../icons/retro/CLITutorIcon'
import DownloadIcon from '../../icons/retro/DownloadIcon'
import FullGradientButton from '../common/atoms/FullGradientButton'
import RetroGradientButton from '../common/atoms/RetroGradientButton'

export const CliTutorialModal = ({ command, t, onLeave, className, downloadConfig, ...props }) => {
  const onClickCopyToClipboard = (cmd) => {
    navigator.clipboard.writeText(cmd).then(() => {
      onLeave()
    })
  }

  return (
    <Modal {...props} className={className + ' generic-modal spacegrotesk'} onCancel={onLeave} style={{ maxWidth: '30em' }}>
      <ModalBody Icon={CLITutorIcon} className='textinputmodal-body white spacegrotesk tc gray pb2'>
        <p className='spacegrotesk w-100 white center' style={{ lineHeight: '1.3' }}>
          {t('app:cliModal.description')}
        </p>
        <p className='spacegrotesk gray w-100 center'>
          {command && command === cliCommandList[cliCmdKeys.UPDATE_IPFS_CONFIG]() ? t('settings:cliModal.extraNotesJsonConfig') : ''}
          {command && command.startsWith(cliCmdPrefixes.PIN_OBJECT) ? t('files:cliModal.extraNotesPinning') : ''}
        </p>
        <div>
          <Shell className='tl mb2 spacegrotesk' title="Shell">
            <code className='db spacegrotesk'><span className='no-select spacegrotesk'>$ </span>{command}</code>
          </Shell>
        </div>
      </ModalBody>

      <ModalActions>
        <div className='w-100 flex items-center justify-around mt2'>
          <RetroGradientButton width='120px' minHeight='38px' height='38px' className=' tc' bg='bg-gray' onClick={onLeave}>
            <RetroText className='spacegrotesk white'>
              {t('app:actions.close')}
            </RetroText>
          </RetroGradientButton>
          <div className='flex items-center'>
            {
              command && command === cliCommandList[cliCmdKeys.UPDATE_IPFS_CONFIG]()
                ? <DownloadIcon onClick={downloadConfig} className='dib fill-current-color retro-black hover-white hover-bg-blue pointer mh2' style={{ height: 24 }}
                /> : <div />
            }
            <FullGradientButton width='120px' minHeight='38px' height='38px' className='tc' onClick={() => onClickCopyToClipboard(command)}>
              <RetroText className='spacegrotesk white'>
                {t('app:actions.copy')}
              </RetroText>
            </FullGradientButton>
          </div>
        </div>
      </ModalActions>
    </Modal>
  )
}

const CliTutorMode = ({
  t, filesPage, isCliTutorModeEnabled, onLeave, isCliTutorModalOpen, command, config, showIcon, doOpenCliTutorModal, buttonClassName
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
      return <CliTutorialModal
        id='clitutormodal_files'
        className='outline-0 transBottomUp'
        onLeave={() => {
          const modalNode = document.getElementById('clitutormodal_files')
          if (modalNode) {
            modalNode.classList.add('translateY')
          }
          setTimeout(() => {
            onLeave()
          }, 200)
        }}
        t={t}
        command={command}
      />
    }
    return (
      <Fragment>
        {
          showIcon
            ? <CLITutorIcon onClick={() => doOpenCliTutorModal(true)} fill='#8476bb' className={'dib pointer ' + buttonClassName} style={{ height: 44 }} />
            : <div />
        }
        <Overlay show={isCliTutorModalOpen} onLeave={() => doOpenCliTutorModal(false)}>
          <CliTutorialModal
            id='clitutormodal'
            className='outline-0 transBottomUp'
            onLeave={() => {
              const modalNode = document.getElementById('clitutormodal')
              if (modalNode) {
                modalNode.classList.add('translateY')
              }
              setTimeout(() => {
                doOpenCliTutorModal(false)
              }, 500)
            }}
            t={t}
            command={command}
            downloadConfig={() => downloadConfig(config)} />
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

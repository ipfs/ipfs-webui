import React from 'react'
import PropTypes from 'prop-types'
import ShareIcon from '../../../icons/StrokeShare'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'
import FullGradientButton from '../../../components/common/atoms/FullGradientButton'
import RetroGradientButton from '../../../components/common/atoms/RetroGradientButton'
import RetroInput from '../../../components/common/atoms/RetroInput'
import RetroText from '../../../components/common/atoms/RetroText'
import { StyledIconContainer, StyledModalTitle } from '../new-folder-modal/NewFolderModal'
import FileShareIcon from '../../../icons/retro/files/FileShareIcon'

const ShareModal = ({ t, tReady, onLeave, link, files, className, ...props }) => (
  <Modal {...props} className={className + ' generic-modal spacegrotesk'} onCancel={onLeave} style={{ maxWidth: '24em' }}>
    <ModalBody title={
      <StyledModalTitle>
        <StyledIconContainer>
          <FileShareIcon width='30px' height='30px' />
        </StyledIconContainer>
        {t('shareModal.title')}
        <span className='purple pl2'>
          {files && files.length && files[0].name}
          {files && files.length > 1 && '...'}
        </span>
      </StyledModalTitle>
    } Icon={ShareIcon} className='textinputmodal-body white spacegrotesk gray pb2'>
      <p className='spacegrotesk grayColor  center'>{t('shareModal.description')}</p>

      <div className='flex center pb2 '>
        <RetroInput
          value={link}
          fontSize={14}
          height='41px'
          readOnly
          className={'input-reset flex-grow-1 charcoal-muted ba b--black-20 br1 pa2 mr2 focus-outline'}
          type='text' />
      </div>
    </ModalBody>

    <ModalActions className='ph3'>
      <RetroGradientButton width='calc((100% - 40px) / 2)' onClick={onLeave} height='38px'>
        <RetroText className="white tc spacegrotesk">
          {t('app:actions.close')}
        </RetroText>
      </RetroGradientButton>
      <CopyToClipboard text={link} onCopy={onLeave}>
        <FullGradientButton width='calc((100% - 40px) / 2)' height='38px'>
          <RetroText className="white tc spacegrotesk">
            {t('app:actions.copy')}
          </RetroText>
        </FullGradientButton>
      </CopyToClipboard>
    </ModalActions>
  </Modal>
)

ShareModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  link: PropTypes.string,
  files: PropTypes.array,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

ShareModal.defaultProps = {
  className: ''
}

export default withTranslation('files')(ShareModal)

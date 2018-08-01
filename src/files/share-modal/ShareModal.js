import React from 'react'
import PropTypes from 'prop-types'
import ShareIcon from '../../icons/StrokeShare'
import Button from '../../components/button/Button'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Modal, ModalActions, ModalBody } from '../../components/modal/Modal'

const ShareModal = ({onLeave, link, className, ...props}) => (
  <Modal {...props} className={className} onCancel={onLeave} >
    <ModalBody title='Share Files' icon={ShareIcon}>
      <p className='gray w-80 center'>
        Copy the link below and share it with your friends.
      </p>

      <div className='flex center w-100 pa2'>
        <input
          value={link}
          readOnly
          autoFocus
          className={`input-reset flex-grow-1 charcoal-muted ba b--black-20 pa2 mr2 focus-outline`}
          type='text' />
      </div>
    </ModalBody>

    <ModalActions>
      <Button className='ma2' bg='bg-gray' onClick={onLeave}>Close</Button>
      <CopyToClipboard text={link} onCopy={onLeave}>
        <Button className='ma2'>Copy</Button>
      </CopyToClipboard>
    </ModalActions>
  </Modal>
)

ShareModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  link: PropTypes.string
}

ShareModal.defaultProps = {
  className: ''
}

export default ShareModal

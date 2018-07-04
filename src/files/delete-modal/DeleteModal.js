import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, FormattedMessage } from 'react-intl'
import TrashIcon from '../../icons/StrokeTrash'
import Button from '../../components/button/Button'
import { Modal, ModalActions, ModalBody } from '../modal/Modal'

const messages = defineMessages({
  deleteItem: {
    id: 'app.deleteModal.deleteItem',
    defaultMessage: `Delete {count, plural,
      one {Item}
      other {Items}
    }`
  },
  deleteFolder: {
    id: 'app.deleteModal.deleteFolder',
    defaultMessage: `Delete {count, plural,
      one {Folder}
      other {Folders}
    }`
  },
  deleteFile: {
    id: 'app.deleteModal.deleteFile',
    defaultMessage: `Delete {count, plural,
      one {File}
      other {Files}
    }`
  },
  messageItem: {
    id: 'app.deleteModal.messageItem',
    defaultMessage: `Are you sure you want to delete {count, plural,
      one {this item}
      other {these items}
    }? This action is permanent and cannot be reversed.`
  },
  messageFolder: {
    id: 'app.deleteModal.messageFolder',
    defaultMessage: `Are you sure you want to delete {count, plural,
      one {this folder}
      other {these folders}
    }? This action is permanent and cannot be reversed.`
  },
  messageFile: {
    id: 'app.deleteModal.messageFile',
    defaultMessage: `Are you sure you want to delete {count, plural,
      one {this file}
      other {these files}
    }? This action is permanent and cannot be reversed.`
  }
})

const DeleteModal = ({onCancel, onDelete, folders, files, className, ...props}) => {
  let title, message, count

  if (folders > 0) {
    if (files > 0) {
      title = messages.deleteItem
      count = files + folders
      message = messages.messageItem
    } else {
      title = messages.deleteFolder
      count = folders
      message = messages.messageFolder
    }
  } else {
    title = messages.deleteFile
    count = files
    message = messages.messageFile
  }

  return (
    <Modal {...props} className={className} onCancel={onCancel} >
      <ModalBody title={<FormattedMessage {...title} values={{count: count}} />} icon={TrashIcon}>
        <p className='gray w-80 center'>
          <FormattedMessage {...message} values={{count: count}} />
        </p>
      </ModalBody>

      <ModalActions>
        <Button className='ma2' bg='bg-gray' onClick={onCancel}>Cancel</Button>
        <Button className='ma2' bg='bg-red' onClick={onDelete}>Delete</Button>
      </ModalActions>
    </Modal>
  )
}

DeleteModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  files: PropTypes.number,
  folders: PropTypes.number
}

DeleteModal.defaultProps = {
  className: '',
  files: 0,
  folders: 0
}

export default DeleteModal

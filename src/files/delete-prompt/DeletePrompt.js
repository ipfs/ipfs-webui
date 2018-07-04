import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, FormattedMessage } from 'react-intl'
import TrashIcon from '../../icons/StrokeTrash'
import Button from '../../components/button/Button'
import { Prompt, PromptActions, PromptBody } from '../prompt/Prompt'

const messages = defineMessages({
  deleteItem: {
    id: 'app.deletePrompt.deleteItem',
    defaultMessage: `Delete {count, plural,
      one {Item}
      other {Items}
    }`
  },
  deleteFolder: {
    id: 'app.deletePrompt.deleteFolder',
    defaultMessage: `Delete {count, plural,
      one {Folder}
      other {Folders}
    }`
  },
  deleteFile: {
    id: 'app.deletePrompt.deleteFile',
    defaultMessage: `Delete {count, plural,
      one {File}
      other {Files}
    }`
  },
  messageItem: {
    id: 'app.deletePrompt.messageItem',
    defaultMessage: `Are you sure you want to delete {count, plural,
      one {this item}
      other {these items}
    }? This action is permanent and cannot be reversed.`
  },
  messageFolder: {
    id: 'app.deletePrompt.messageFolder',
    defaultMessage: `Are you sure you want to delete {count, plural,
      one {this folder}
      other {these folders}
    }? This action is permanent and cannot be reversed.`
  },
  messageFile: {
    id: 'app.deletePrompt.messageFile',
    defaultMessage: `Are you sure you want to delete {count, plural,
      one {this file}
      other {these files}
    }? This action is permanent and cannot be reversed.`
  }
})

const DeletePrompt = ({onCancel, onDelete, folders, files, className, ...props}) => {
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
    <Prompt {...props} className={className} onCancel={onCancel} >
      <PromptBody title={<FormattedMessage {...title} values={{count: count}} />} icon={TrashIcon}>
        <p className='gray w-80 center'>
          <FormattedMessage {...message} values={{count: count}} />
        </p>
      </PromptBody>

      <PromptActions>
        <Button className='ma2' bg='bg-gray' onClick={onCancel}>Cancel</Button>
        <Button className='ma2' bg='bg-red' onClick={onDelete}>Delete</Button>
      </PromptActions>
    </Prompt>
  )
}

DeletePrompt.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  files: PropTypes.number,
  folders: PropTypes.number
}

DeletePrompt.defaultProps = {
  className: '',
  files: 0,
  folders: 0
}

export default DeletePrompt

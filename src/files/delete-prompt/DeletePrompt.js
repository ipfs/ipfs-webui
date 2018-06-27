import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, FormattedMessage } from 'react-intl'
import TrashIcon from '../../icons/StrokeTrash'
import CancelIcon from '../../icons/GlyphSmallCancel'
import Button from '../../components/button/Button'

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
    id: 'app.deletePrompt.deleteItem',
    defaultMessage: `Are you sure you want to delete {count, plural,
      one {this item}
      other {these items}
    }? This action is permanent and cannot be reversed.`
  },
  messageFolder: {
    id: 'app.deletePrompt.deleteItem',
    defaultMessage: `Are you sure you want to delete {count, plural,
      one {this folder}
      other {these folders}
    }? This action is permanent and cannot be reversed.`
  },
  messageFile: {
    id: 'app.deletePrompt.deleteItem',
    defaultMessage: `Are you sure you want to delete {count, plural,
      one {this file}
      other {these files}
    }? This action is permanent and cannot be reversed.`
  }
})

const DeletePrompt = ({onCancel, onDelete, folders, files, className, ...props}) => {
  className = `${className} bg-white w-80 shadow-4 sans-serif relative`
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
    <div className={className} style={{maxWidth: '30em'}} {...props}>
      <CancelIcon className='absolute pointer w2 h2 top-0 right-0 fill-gray' onClick={onCancel} />

      <div className='ph2 pv3 tc'>
        <div className='center bg-snow br-100 flex justify-center items-center' style={{width: '80px', height: '80px'}}>
          <TrashIcon className='fill-gray w3' />
        </div>

        <p className='charcoal-muted fw5'>
          <FormattedMessage {...title} values={{count: count}} />
        </p>

        <p className='gray w-80 center'>
          <FormattedMessage {...message} values={{count: count}} />
        </p>
      </div>

      <div className='flex justify-between pa2' style={{ backgroundColor: '#f4f6f8' }}>
        <Button className='ma2' bg='bg-gray' onClick={onCancel}>Cancel</Button>
        <Button className='ma2' bg='bg-red' onClick={onDelete}>Delete</Button>
      </div>
    </div>
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

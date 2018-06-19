import React from 'react'
import PropTypes from 'prop-types'
import TrashIcon from '../../icons/StrokeTrash'
import CancelIcon from '../../icons/GlyphSmallCancel'
import Button from '../../components/button/Button'

const DeletePrompt = ({cancel, action, folder, multiple, className, ...props}) => {
  className = `${className} w-80 shadow-4 sans-serif relative`
  let what = 'file'
  if (folder) {
    what = 'folder'
  }

  if (multiple) {
    what += 's'
  }

  return (
    <div className={className} style={{maxWidth: '30em'}} {...props}>
      <CancelIcon className='absolute pointer w2 h2 top-0 right-0 fill-gray' onClick={cancel} />

      <div className='ph2 pv3 tc'>
        <div className='center bg-snow br-100 flex justify-center items-center' style={{width: '80px', height: '80px'}}>
          <TrashIcon className='fill-gray w3' />
        </div>

        <p className='charcoal-muted fw5'>Delete Item</p>

        <p className='gray w-80 center'>
          Are you sure you want to delete this {what}? This action is permanent and cannot be reversed.
        </p>
      </div>

      <div className='flex justify-between pa2' style={{ backgroundColor: '#f4f6f8' }}>
        <Button className='ma2' bg='bg-gray' onClick={cancel}>Cancel</Button>
        <Button className='ma2' bg='bg-red' onClick={action}>Delete</Button>
      </div>
    </div>
  )
}

DeletePrompt.propTypes = {
  cancel: PropTypes.func.isRequired,
  action: PropTypes.func.isRequired,
  folder: PropTypes.bool,
  multiple: PropTypes.bool
}

DeletePrompt.defaultProps = {
  className: '',
  folder: false,
  multiple: false
}

export default DeletePrompt

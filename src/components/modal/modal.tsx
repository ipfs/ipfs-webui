import React from 'react'
import CancelIcon from '../../icons/GlyphSmallCancel'

// Type definitions
interface ModalActionsProps {
  justify?: 'between' | 'center' | 'start' | 'end' | 'around' | 'evenly'
  className?: string
  children?: React.ReactNode
  [key: string]: any
}

interface ModalBodyProps {
  className?: string
  Icon?: React.ComponentType<{ className?: string }>
  title?: string | React.ReactNode
  children?: React.ReactNode
  [key: string]: any
}

interface ModalProps {
  onCancel?: (() => void) | null
  children?: React.ReactNode
  className?: string
  [key: string]: any
}

export const ModalActions: React.FC<ModalActionsProps> = ({
  justify = 'between',
  className = '',
  children,
  ...props
}) => (
  <div
    className={`flex justify-${justify} pa2 ${className}`}
    style={{ backgroundColor: '#f4f6f8' }}
    {...props}
  >
    {children}
  </div>
)

export const ModalBody: React.FC<ModalBodyProps> = ({
  className = '',
  Icon,
  title,
  children,
  ...props
}) => (
  <div className={`ph4 pv3 tc ${className}`} {...props}>
    {Icon && (
      <div
        className='center bg-snow br-100 flex justify-center items-center'
        style={{ width: '80px', height: '80px' }}
      >
        <Icon className='fill-gray w3' />
      </div>
    )}

    <p className='charcoal fw6 truncate'>{title}</p>

    {children}
  </div>
)

export const Modal: React.FC<ModalProps> = ({
  onCancel = null,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`${className} bg-white w-80 shadow-4 sans-serif relative`}
      data-testid="ipfs-modal"
      style={{ maxWidth: '34em' }}
      {...props}
    >
      {onCancel && (
        <CancelIcon
          className='absolute pointer w2 h2 top-0 right-0 fill-gray'
          onClick={onCancel}
        />
      )}

      {children}
    </div>
  )
}

export default Modal

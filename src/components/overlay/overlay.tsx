import React from 'react'
import { Modal } from 'react-overlays'

type ModalProps = React.ComponentProps<typeof Modal>

export interface OverlayProps extends Omit<ModalProps, 'renderBackdrop' | 'onEscapeKeyDown' | 'onBackdropClick'> {
  show: boolean
  onLeave: () => void
  hidden: boolean
}

const Overlay: React.FC<OverlayProps> = ({ children, show, onLeave, className = '', hidden, ...props }) => {
  const handleEscapeKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    onLeave()
  }

  const renderBackdrop: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
    <div className='fixed top-0 left-0 right-0 bottom-0 bg-black o-50' hidden={hidden} {...props} />
  )

  return (
    <Modal
      {...props}
      show={show}
      className={`${className} fixed top-0 left-0 right-0 bottom-0 z-max flex items-center justify-around`}
      renderBackdrop={renderBackdrop}
      onEscapeKeyDown={handleEscapeKeyDown}
      onBackdropClick={onLeave}>
      {children}
    </Modal>
  )
}

export default Overlay

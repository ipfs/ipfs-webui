import React from 'react'
import { Modal } from 'react-overlays'

type ModalProps = React.ComponentProps<typeof Modal>

export interface OverlayProps extends Omit<ModalProps, 'renderBackdrop' | 'onHide'> {
  children: React.ReactNode
  show: boolean
  onLeave: () => void
  hidden: boolean
}

const Overlay: React.FC<OverlayProps> = ({ children, show, onLeave, className = '', hidden, ...props }) => {
  const renderBackdrop = (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div className='fixed top-0 left-0 right-0 bottom-0 bg-black o-50' hidden={hidden} {...props} />
  )

  return (
    // Note: react-overlays Modal manages its own portal and positioning.
    // The Modal child component uses fixed positioning to center itself.
    // onHide handles both backdrop clicks and escape key presses.
    // @ts-ignore - react-overlays(children) is not typed
    <Modal
      {...props}
      show={show}
      backdrop={true}
      className={`${className} z-max`}
      renderBackdrop={renderBackdrop}
      onHide={onLeave}
      >
       {children}
      </Modal>
  )
}

export default Overlay

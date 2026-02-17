import React from 'react'
import { Modal } from 'react-overlays'

export interface OverlayProps {
  show: boolean
  onLeave: () => void
  hidden?: boolean
  className?: string
  children?: React.ReactNode
}

const Overlay: React.FC<OverlayProps> = ({ children, show, onLeave, hidden }) => {
  return (
    <Modal
      show={show}
      backdrop={true}
      onHide={onLeave}
      renderBackdrop={(props) => (
        <div className='fixed top-0 left-0 right-0 bottom-0 bg-black o-50 z-max' hidden={hidden} {...props} />
      )}
      renderDialog={(dialogProps) => (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
        <div
          {...dialogProps}
          role='dialog'
          className={`${dialogProps.className || ''} fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-max`}
          style={{ outline: 'none' }}
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget) onLeave()
          }}
        >
          {children}
        </div>
      )}>
      {children}
    </Modal>
  )
}

export default Overlay

import React, { ReactElement } from 'react'
import { Modal } from 'react-overlays'

interface OverlayProps {
  children: React.ReactNode
  show: boolean
  onLeave: () => void
  className: string
  hidden: boolean
}

const Overlay: React.FC<OverlayProps> = ({ children, show, onLeave, className, hidden, ...props }): ReactElement<any> => {
  const handleKeyDown = (e: React.KeyboardEvent): null | void => {
    if (e.key !== 'Escape') return null

    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()

    onLeave()
  }

  const renderBackdrop = (): React.ReactNode => {
    return (
      <div className='fixed top-0 left-0 right-0 bottom-0 bg-black o-50' hidden={hidden} {...props}></div>
    )
  }

  return (
    <Modal
      {...props}
      show={show}
      className={`${className} fixed top-0 left-0 right-0 bottom-0 z-max flex items-center justify-around`}
      renderBackdrop={renderBackdrop}
      onKeyDown={handleKeyDown}
      onBackdropClick={onLeave}>
      {children}
    </Modal>
  )
}

export default Overlay

import React, { ReactElement } from 'react'
// @ts-ignore - react-overlays is not typed
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

  const renderDialog = (): React.ReactNode => {
    return (
      <div className={`${className} fixed top-0 left-0 right-0 bottom-0 z-max flex items-center justify-around`}>
        {children}
      </div>
    )
  }

  return (
    <Modal
      {...props}
      show={show}
      renderBackdrop={renderBackdrop}
      renderDialog={renderDialog}
      onEscapeKeyDown={handleKeyDown}
      onBackdropClick={onLeave}>
    </Modal>
  )
}

export default Overlay

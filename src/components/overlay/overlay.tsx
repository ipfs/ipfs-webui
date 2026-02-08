import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface OverlayProps {
  show: boolean
  onLeave: () => void
  hidden?: boolean
  className?: string
  children?: React.ReactNode
}

const Overlay: React.FC<OverlayProps> = ({ children, show, onLeave, className = '', hidden }) => {
  useEffect(() => {
    if (!show) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onLeave()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [show, onLeave])

  if (!show) return null

  const overlay = (
    <>
      <div
        className='fixed top-0 left-0 right-0 bottom-0 bg-black o-50'
        hidden={hidden}
        onClick={onLeave}
        onKeyDown={(e) => e.key === 'Enter' && onLeave()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        style={{ zIndex: 9998 }}
      />

      <div
        className={`${className} fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center`}
        style={{ zIndex: 9999, pointerEvents: 'none', padding: '2rem' }}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ pointerEvents: 'auto', maxWidth: '100%', maxHeight: '100%', overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </>
  )

  return createPortal(overlay, document.body)
}

export default Overlay

import { memo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const Portal = ({ id, children, zIndex }) => {
  const el = useRef(document.getElementById(id) || document.createElement('div'))
  const [dynamic] = useState(!el.current.parentElement)

  useEffect(() => {
    if (dynamic) {
      el.current.id = id
      zIndex && (el.current.style.zIndex = zIndex)
      document.body.appendChild(el.current)
    }
    return () => {
      if (dynamic && el.current.parentElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        el.current.parentElement.removeChild(el.current)
      }
    }
  }, [dynamic, id, zIndex])
  return createPortal(children, el.current)
}
export default memo(Portal)

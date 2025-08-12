import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'

interface TooltipProps {
  children: React.ReactElement
  text: string
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, ...props }) => {
  const [show, setShow] = useState(false)
  const [overflow, setOverflow] = useState(true)
  const el = useRef<HTMLElement | null>(null)

  const onResize = useCallback(() => {
    if (
      el.current &&
      overflow !== (el.current.offsetWidth < el.current.scrollWidth)
    ) {
      setOverflow(!overflow)
    }
  }, [overflow])

  useEffect(() => {
    window.addEventListener('resize', onResize)
    onResize()

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

  const onMouseOver = () => {
    setShow(true)
  }

  const onMouseLeave = () => {
    setShow(false)
  }

  const tooltipDisplayClass = useMemo(() => show && overflow ? 'db' : 'dn', [show, overflow])

  return (
    <div className='relative' {...props}>
      <div
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        onFocus={onMouseOver}
        onBlur={onMouseLeave}
        className='overflow-hidden'
      >
        {React.Children.map(children, (c) =>
          React.cloneElement(c, {
            ref: (n: HTMLElement) => {
              el.current = n
            }
          })
        )}
      </div>

      <div
        style={{
          bottom: '-10px',
          left: '50%',
          transform: 'translate(-50%, 100%)',
          wordWrap: 'break-word',
          width: '100%'
        }}
        className={`white z-max bg-navy-muted br2 pa1 f6 absolute ${tooltipDisplayClass}`}
      >
        <span
          style={{
            width: '17px',
            height: '17px',
            transform: 'translate(-50%, -50%) rotate(45deg)',
            borderRadius: '2px 0px 0px',
            left: '50%',
            zIndex: -1
          }}
          className='db bg-navy-muted absolute'
        />
        {text}
      </div>
    </div>
  )
}

export default Tooltip

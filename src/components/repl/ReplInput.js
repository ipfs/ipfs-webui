import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import CartRightIcon from '../../icons/CartRightIcon'

export default function ReplInput ({ ready, handleRunCommand }) {
  const [input, setInput] = useState('')
  const [inputRef, setInputRef] = useState(null)
  const [commandHistory, setCommandHistory] = useState([])
  const [cursor, setCursor] = useState(0)

  const focus = useCallback(() => {
    if (inputRef) {
      setTimeout(() => {
        inputRef.focus()
      }, 0)
    }
  }, [inputRef])

  const handleKeyUp = useCallback((e) => {
    // Enter
    if (e.keyCode === 13) {
      handleRunCommand(input)
      setCommandHistory(s => {
        const next = [...s, input]
        setCursor(next.length)
        return next
      })
      setInput('')
      return
    }

    if (e.keyCode === 38) {
      if (cursor > 0) {
        setInput(commandHistory[cursor - 1] || '')
        setCursor(cursor - 1)
      }
      focus()
    }

    if (e.keyCode === 40) {
      if (cursor < commandHistory.length) {
        setInput(commandHistory[cursor + 1] || '')
        setCursor(cursor + 1)
      }

      focus()
    }
  }, [cursor, commandHistory, input, focus, handleRunCommand])

  return (
    <div className='flex pa2 items-center'>
      <CartRightIcon />
      {ready ? (
        <input
          ref={setInputRef}
          id="shell-input"
          style={{ outline: 'none' }}
          className='f7 pl2 mb0 bg-transparent monospace b--none white b--none w-100'
          onKeyUp={handleKeyUp}
          value={input}
          autoComplete='off'
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          onChange={e => setInput(e.target.value)}
        />
      ) : (
        <div className='f7 pl2 w-100 mb0 bg-transparent monospace b--none white'>
          <span className='f7'>Connecting to IPFS...</span>
        </div>
      )}
    </div>
  )
}

ReplInput.propTypes = {
  ready: PropTypes.bool,
  handleRunCommand: PropTypes.func
}

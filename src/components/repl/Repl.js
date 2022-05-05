import React, { useState, useEffect } from 'react'
import GlyphCode from '../../icons/GlyphCode'
import HttpClient from 'ipfs-http-client'

export default function Repl () {
  const [username] = useState('mikiasabera@MacBook-Pro')
  const [client, setClient] = useState(null)
  const [showRepl, setShowRepl] = useState(false)
  const [history, setHistory] = useState([])
  const [historyRef, setHistoryRef] = useState(null)
  const [inputRef, setInputRef] = useState(null)
  const [commandHistory, setCommandHistory] = useState([])
  const [commandHistoryCursor, setCommandHistoryCursor] = useState(0)
  const [commandOptions, setCommandOptions] = useState([])
  const [input, setInput] = useState('')

  const handleKeyUp = (e) => {
    // Enter
    if (e.keyCode === 13) {
      processCommand(e.target.value)
      setCommandHistoryCursor(0)
    }

    // Up
    if (e.keyCode === 38) {
      e.preventDefault()
      if (commandHistory.length > commandHistoryCursor && commandHistoryCursor >= 0) {
        setCommandHistoryCursor(s => {
          const newCursor = s + 1
          setInput(commandHistory[commandHistory.length - 1 - newCursor] || '')
          return newCursor
        })
      }

      setTimeout(() => {
        console.log({ inputRef })
        inputRef.focus()
      }, 0)
    }

    // Down
    if (e.keyCode === 40) {
      e.preventDefault()
      if (commandHistory.length >= commandHistoryCursor && commandHistoryCursor > 0) {
        setCommandHistoryCursor(s => {
          const newCursor = commandHistoryCursor - 1
          setInput(commandHistory[commandHistory.length - 1 - newCursor] || '')
          return newCursor
        })
      }

      setTimeout(() => {
        console.log({ inputRef })
        inputRef.focus()
      }, 0)
    }
  }

  useEffect(() => {
    const scrollToBottom = () => {
      if (!historyRef) {
        return
      }
      historyRef.scrollTop = historyRef.scrollHeight
    }

    scrollToBottom()
  }, [history, historyRef])

  useEffect(() => {
    if (!client) {
      const c = HttpClient()
      if (c) {
        setClient(c)
        setCommandOptions(
          Object.keys(c).reduce((acc, key) => {
            const command = c[key]
            return {
              ...acc,
              [key]: typeof command === 'function'
                ? { params: command.length }
                : { params: 0, commands: Object.keys(command) }
            }
          }, {})
        )
      }
    }
    console.log({ ls: client?.ls() })
  }, [])

  /**
   *
   * @param {*} command
   */
  const processCommand = (command) => {
    setHistory(s => [...s, `${username} % ${command}`])
    setCommandHistory(s => [...s, command])
    setInput('')

    const [first, second, ...rest] = command.split(' ')
    if (first === 'exit') {
      setShowRepl(false)
      return
    }

    if (first !== 'ipfs') {
      setHistory(s => [...s, `command not found: ${first}`])
      return
    }

    if (!second) {
      setHistory(s => [...s, <>

        Available Commands

        {Object.keys(commandOptions).map(line => <div key={line} className='pl2'>{line}</div>)}

      </>
      ])
      return
    }

    if (!commandOptions[second]) {
      setHistory(s => [...s, `command not found: ${first} ${second}`])
      return
    }

    console.log({ first, second, rest })
  }

  return (
    <div className='fixed bottom-0 right-0 relative w-100 pl6 pb5'>
      {showRepl ? (
        <div className='w-100 pl4 h5'>
          <label htmlFor="shell-input">
            <div className='h-100 br1 overflow-hidden white bg-black-70 flex flex-column-reverse'>
              <div className='flex pa2'>
                {'> '}
                <input
                  ref={setInputRef}
                  id="shell-input"
                  className='f7 pl2 w-100 mb0 bg-transparent monospace b--none white'
                  onKeyUp={handleKeyUp}
                  value={input}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  onChange={e => setInput(e.target.value)}
                />
              </div>

              <div className='snow pa2 f7 h-100 overflow-y-auto' ref={setHistoryRef}>
                {history.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </label>
        </div>
      ) : null}
      <div className="fixed bottom-0 right-2">
        <button onClick={() => setShowRepl(s => !s)}>
          <GlyphCode outlined={!showRepl} />
        </button>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import GlyphCode from '../../icons/GlyphCode'
import HttpClient from 'ipfs-http-client'

export default function Repl () {
  const [username] = useState('mikiasabera@MacBook-Pro')
  const [client] = useState(HttpClient())
  const [showRepl, setShowRepl] = useState(false)
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')

  const handleKeyUp = (e) => {
    if (e.keyCode === 13) {
      processCommand(e.target.value)
    }
  }

  useEffect(() => {
    console.log({ client })
  }, [client])

  /**
   *
   * @param {*} command
   */
  const processCommand = (command) => {
    setHistory(s => [...s, `${username} % ${command}`])
    setInput('')
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
                  id="shell-input"
                  className='f7 pl2 w-100 mb0 bg-transparent monospace b--none white'
                  onKeyUp={handleKeyUp}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
              </div>

              <div className='snow pa2 f7'>
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

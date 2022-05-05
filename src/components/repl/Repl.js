import React, { useState, useEffect } from 'react'
import GlyphCode from '../../icons/GlyphCode'
import HttpClient from 'ipfs-http-client'
import ReplInput from './ReplInput'
import ReplHistory from './ReplHistory'
import { connect } from 'redux-bundler-react'

function Repl ({ ipfs }) {
  const [username] = useState('mikiasabera@MacBook-Pro')
  const [client, setClient] = useState(null)
  const [showRepl, setShowRepl] = useState(false)
  const [history, setHistory] = useState([])
  const [historyRef, setHistoryRef] = useState(null)
  const [commandOptions, setCommandOptions] = useState([])

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
    if (!ipfs || !ipfs.ready || !ipfs.apiAddress) {
      return
    }

    if (!client) {
      const c = HttpClient({ url: ipfs.apiAddress })
      if (c) {
        setClient(c)
        setCommandOptions(
          Object.keys(c).reduce((acc, key) => {
            const command = c[key]
            return {
              ...acc,
              [key]: typeof command === 'function'
                ? { type: 'command', params: command.length }
                : { type: 'object', params: 0, commands: Object.keys(command) }
            }
          }, {})
        )
      }
    }
    console.log({ ls: client?.ls() })
  }, [ipfs, client])

  /**
   *
   * @param {*} command
   */
  const processCommand = (command) => {
    setHistory(s => [...s, `${username} % ${command}`])

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

    if (commandOptions[second].type === 'command') {
      client[second]()
    }

    console.log({ first, second, rest })
  }

  return (
    <div className='fixed bottom-0 right-0 relative w-100 pl6 pb5'>
      {showRepl ? (
        <div className='w-100 pl4 h5'>
          <label htmlFor="shell-input">
            <div className='h-100 br1 overflow-hidden white bg-black-70 flex flex-column-reverse'>
              <ReplInput ready={!!client} handleRunCommand={processCommand} />
              <ReplHistory history={history} setHistoryRef={setHistoryRef} />
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

export default connect('selectIpfs', Repl)

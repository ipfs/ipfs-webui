import React, { useState, useEffect, useMemo } from 'react'
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
                ? { type: 'function', params: command.length }
                : { type: 'object', params: 0, commands: Object.keys(command) }
            }
          }, {})
        )
      }
    }
  }, [ipfs, client])

  const availableCommands = useMemo(() => {
    if (!commandOptions) {
      return ''
    }

    return (
      <>

        Available Commands

        {Object.keys(commandOptions).map(line => <div key={line} className='pl2'>{line}</div>)}

      </>
    )
  }, [commandOptions])

  const parseFunctionString = (string) => {
    // eslint-disable-next-line no-useless-escape
    const [fnName, ...args] = string.split(/[\(,\)]/g).slice(0, -1).map(v => v.trim()).filter(x => !!x)
    const name = fnName || string
    const command = commandOptions[name]
    return { name, args, command, calledAs: string }
  }

  /**
   *
   * @param {*} command
   */
  const processCommand = async (command) => {
    setHistory(s => [...s, `${username} % ${command}`])

    const [first, ...rest] = command.split('.')

    if (first === 'exit') {
      setShowRepl(false)
      return
    }

    if (first !== 'ipfs') {
      setHistory(s => [...s, `command not found: ${first}`])
      return
    }

    if (command === 'ipfs') {
      setHistory(s => [...s, availableCommands])
      return
    }

    const chain = rest.map(r => parseFunctionString(r))
    let result = client

    for (const c of chain) {
      if (!c.command) {
        setHistory(s => [...s, `command not found: ${command}`])
        return
      }

      if (c.command.type === 'function') {
        try {
          const output = await result[c.name](...c.args)
          setHistory(s => [...s, JSON.stringify(output)])
        } catch (err) {
          console.log({ err })
          setHistory(s => [...s, `Error running command: ${err.message}`])
        }
        return
      }

      // Incorrectly called as a function
      if (c.command.type === 'object' && c.calledAs.includes('(')) {
        setHistory(s => [...s, `${c.name} is not a function`])
        return
      }

      result = result[c.name]
    }

    const output = result
    if (JSON.stringify(output) === '{}') {
      setHistory(s => [...s, JSON.stringify(`Available keys: ${Object.keys(result).join(', ')}`)])
    } else {
      setHistory(s => [...s, JSON.stringify(output)])
    }
  }

  return (
    <div className='fixed bottom-0 right-0 relative w-100 pl6-ns pb5'>
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

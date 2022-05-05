import React from 'react'
import PropTypes from 'prop-types'

export default function ReplHistory ({ history, setHistoryRef }) {
  return (
    <div className='snow pa2 f7 h-100 overflow-y-auto' ref={setHistoryRef}>
      {history.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  )
}

ReplHistory.propTypes = {
  history: PropTypes.arrayOf(PropTypes.string).isRequired,
  setHistoryRef: PropTypes.func.isRequired
}

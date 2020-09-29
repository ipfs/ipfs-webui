import React from 'react'
import PropTypes from 'prop-types'

export const Definition = ({ term, desc, advanced, termWidth }) => (
  <div className='dt dt--fixed pt1 mw9 lh-copy'>
    <Term width={termWidth}>
      {term}
    </Term>
    <Description advanced={advanced}>
      {desc}
    </Description>
  </div>
)

Definition.propTypes = {
  term: PropTypes.node.isRequired,
  desc: PropTypes.node,
  advanced: PropTypes.bool,
  termWidth: PropTypes.number
}

export const Term = ({ children, width = 100 }) => {
  return (
    <dt className='db ma0 pb1 pb0-ns dtc-ns silver tracked ttu f7' style={{ width }}>
      {children}
    </dt>
  )
}

export const Description = ({ children, advanced }) => {
  return (
    <dd className={`db dtc-ns ma0 charcoal monospace ${advanced ? 'word-wrap pa2 f7 bg-white-80' : 'truncate f7 f6-ns'}`}>
      {children}
    </dd>
  )
}

// This is here as a reminder that you have to wrap you Definitions
// in a `<dl>`, and as a placeholder in case we want to style the dl element
// in the future?
export const DefinitionList = ({ children, className = 'ma0', ...props }) => {
  return (
    <dl className={className} {...props}>
      {children}
    </dl>
  )
}

export default Definition

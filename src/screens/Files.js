import React from 'react'
import PropTypes from 'prop-types'

import Listing from '../panes/Listing'

function breadcrumbs (root) {
  root = root || '/'
  if (root.endsWith('/')) {
    root = root.substring(0, root.length - 2)
  }

  let parts = root.split('/')

  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i - 1] + '/' + parts[i]
  }

  parts[0] = '/'
  return parts
}

export default function Files (props) {
  const navigate = (path) => { props.history.push(path) }

  const parts = breadcrumbs(props.match.params[0])
  console.log(parts)

  return parts.map((part) => {
    return (
      <Listing
        key={part}
        root={part}
        navigate={navigate}
        utility={props.utility}
      />
    )
  })
}

Files.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  utility: PropTypes.object.isRequired
}

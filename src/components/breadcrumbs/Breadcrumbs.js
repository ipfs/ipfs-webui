import React from 'react'
import PropTypes from 'prop-types'
import './Breadcrumbs.css'

function makeBread (root) {
  if (root.endsWith('/'))
    root = root.substring(0, root.length - 1)

  if (root.startsWith('/'))
    root = root.substring(1, root.length)

  let parts = root.split('/').map(part => {
    return {
      name: part,
      path: part
    }
  })

  parts[0].path = `/${parts[0].path}`

  for (let i = 1; i < parts.length; i++) {
    parts[i] = {
      name: parts[i].name,
      path: parts[i - 1].path + '/' + parts[i].path
    }
  }

  return parts
}

export default function Breadcrumbs ({path, onClick, className = '', ...props}) {
  const cls = `Breadcrumbs sans-serif f4 ${className}`
  const bread = makeBread(path)
  const last = bread.pop()
  const res = []

  bread.forEach((link, index) => {
    res.push(<a className='pointer' key={`${index}link`} onClick={() => { onClick(link.path) }}>{link.name}</a>)
    res.push(<span className='mh1' key={`${index}divisor`}>></span>)
  })

  res.push(<a key='last-link'>{last.name}</a>)

  return (
    <div className={cls} {...props}>{res}</div>
  )
}

Breadcrumbs.propTypes = {
  path: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}

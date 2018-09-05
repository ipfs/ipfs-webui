import React from 'react'
import PropTypes from 'prop-types'

function makeBread (root) {
  if (root.endsWith('/')) {
    root = root.substring(0, root.length - 1)
  }

  let parts = root.split('/').map(part => {
    return {
      name: part,
      path: part
    }
  })

  for (let i = 1; i < parts.length; i++) {
    parts[i] = {
      name: parts[i].name,
      path: parts[i - 1].path + '/' + parts[i].path
    }
  }

  parts[0].name = 'Home'
  parts[0].path = '/'

  return parts
}

export default function Breadcrumbs ({ path, onClick, className = '', ...props }) {
  const cls = `Breadcrumbs sans-serif ${className}`
  const bread = makeBread(path)

  const res = bread.map((link, index) => ([
    <div key={`${index}link`} className='dib bb bw1 pv1' style={{ borderColor: '#244e66' }}>
      <a className='pointer dib link dark-gray o-50 glow' onClick={() => onClick(link.path)}>
        {link.name}
      </a>
    </div>,
    <div key={`${index}divider`} className='dib ph2 pv1 gray v-top'>/</div>
  ]))

  res[res.length - 1].pop()

  return (
    <nav aria-label='Breadcrumb' className={cls} {...props}>{res}</nav>
  )
}

Breadcrumbs.propTypes = {
  path: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}

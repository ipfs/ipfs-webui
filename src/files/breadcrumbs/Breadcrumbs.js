import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'

function makeBread (root, t) {
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

  parts.shift()

  return parts
}

function Breadcrumbs ({ t, tReady, path, onClick, className = '', ...props }) {
  const cls = `Breadcrumbs sans-serif ${className}`
  const bread = makeBread(path, t)

  console.log(bread)

  const res = bread.map((link, index) => ([
    <div key={`${index}link`} className='dib bb bw1 pv1' style={{ borderColor: '#244e66' }}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className='pointer dib link dark-gray o-50 glow' onClick={() => onClick(link.path)}>
        {link.name}
      </a>
    </div>,
    <div key={`${index}divider`} className='dib ph2 pv1 gray v-top'>/</div>
  ]))

  res.unshift(<div key={`b-divider`} className='dib pr2 pv1 gray v-top'>/</div>)

  res[res.length - 1].pop()

  return (
    <nav aria-label={t('breadcrumbs')} className={cls} {...props}>{res}</nav>
  )
}

Breadcrumbs.propTypes = {
  path: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

export default translate('files')(Breadcrumbs)

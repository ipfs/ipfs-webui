import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'

function makeBread (root) {
  if (root.endsWith('/')) {
    root = root.substring(0, root.length - 1)
  }

  const parts = root.split('/').map(part => {
    return {
      name: part,
      path: part
    }
  })

  for (let i = 1; i < parts.length; i++) {
    const name = parts[i].name

    parts[i] = {
      name: name,
      path: parts[i - 1].path + '/' + parts[i].path
    }

    if (name.length >= 30) {
      parts[i].realName = name
      parts[i].name = `${name.substring(0, 4)}...${name.substring(name.length - 4, name.length)}`
    }
  }

  parts.shift()
  parts[0].disabled = true

  parts[parts.length - 1].last = true
  return parts
}

function Breadcrumbs ({ t, tReady, path, onClick, className = '', ...props }) {
  const cls = `Breadcrumbs flex items-center sans-serif f4 ${className}`
  const bread = makeBread(path)
  const root = bread[0]

  if (root.name === 'files' || root.name === 'pins') {
    bread.shift()
  }

  const res = bread.map((link, index) => ([
    <div key={`${index}divider`} className='dib pr2 pv1 mid-gray v-top'>/</div>,
    <div key={`${index}link`} className='dib pv1 pr2'>
      { link.disabled
        ? <span title={link.realName} className='gray'>{link.name}</span>
        /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
        : <a title={link.realName} className={`pointer navy ${link.last ? 'b' : ''}`} onClick={() => onClick(link.path)}>
          {link.name}
        </a>
      }
    </div>
  ]))

  if (res.length === 0) {
    res.push(<div key='root-divider' className='dib pv1 mid-gray v-top'>/</div>)
  }

  if (root.name === 'files' || root.name === 'pins') {
    /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
    res.unshift(<a key={`${root.name}-label`}
      title={root.realName}
      onClick={() => onClick(root.path)}
      className='f6 pointer pa1 bg-navy br2 mr2 white'>
      {t(root.name)}
    </a>)
  }

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

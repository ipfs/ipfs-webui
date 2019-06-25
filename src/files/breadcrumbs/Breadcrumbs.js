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
    let name = parts[i].name

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

  if (parts[0].name !== 'ipfs' && parts[0].name !== 'home') {
    parts[0].disabled = true
  }

  parts[parts.length - 1].last = true
  return parts
}

function Breadcrumbs ({ t, tReady, path, onClick, className = '', ...props }) {
  const cls = `Breadcrumbs sans-serif f4 ${className}`
  const bread = makeBread(path, t)

  const res = bread.map((link, index) => ([
    <div key={`${index}link`} className='dib pv1'>
      { link.disabled
        ? <span title={link.realName} className='gray'>{link.name}</span>
        /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
        : <a title={link.realName} className={`pointer navy ${link.last ? 'b' : ''}`} onClick={() => onClick(link.path)}>
          {link.name}
        </a>
      }
    </div>,
    <div key={`${index}divider`} className='dib ph2 pv1 mid-gray v-top'>/</div>
  ]))

  res.unshift(<div key={`b-divider`} className='dib pr2 pv1 mid-gray v-top'>/</div>)

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

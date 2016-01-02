import React, {PropTypes} from 'react'
import {Link} from 'react-router'

import i18n from '../utils/i18n'
import Icon from './icon'

function NavItem ({title, url, icon}) {
  return (
    <Link className='link' to={url} activeClassName='active'>
      <Icon glyph={icon} /> {i18n.t(title)}
    </Link>
  )
}

NavItem.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired
}

export default NavItem

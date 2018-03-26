import React from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom'

import i18n from '../../utils/i18n'
import Path from '../../utils/path'

const PermaLink = ({url}) => {
  if (!url) return null

  return (
    <li className='list-group-item'>
      <span>{i18n.t('permalink')}</span>
      <Link to={`/objects/${url.urlify()}`}>
        {url.toString()}
      </Link>
    </li>
  )
}

PermaLink.propTypes = {
  url: PropTypes.instanceOf(Path)
}

export default PermaLink

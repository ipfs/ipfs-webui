import React, {PropTypes} from 'react'
import {Link} from 'react-router'

import Path from '../../utils/path'
import i18n from '../../utils/i18n'
import Icon from '../icon'

const ParentLink = ({parent}) => {
  if (!parent) return <span></span>

  return (
    <Link className='btn btn-primary' to={`/objects/${parent.urlify()}`}>
      <Icon glyph='arrow-up' /> {i18n.t('Parent object')}
    </Link>
  )
}

ParentLink.propTypes = {
  parent: PropTypes.instanceOf(Path)
}

export default ParentLink

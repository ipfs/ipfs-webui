import React, {PropTypes} from 'react'
import {LinkContainer} from 'react-router-bootstrap'
import {Button} from 'react-bootstrap'

import Path from '../../utils/path'
import i18n from '../../utils/i18n'
import Icon from '../icon'

const ParentLink = ({parent}) => {
  if (!parent) return <span></span>

  return (
    <LinkContainer to={`/objects/${parent.urlify()}`}>
      <Button bsStyle='primary'>
        <Icon glyph='arrow-up' /> {i18n.t('Parent object')}
      </Button>
    </LinkContainer>
  )
}

ParentLink.propTypes = {
  parent: PropTypes.instanceOf(Path)
}

export default ParentLink

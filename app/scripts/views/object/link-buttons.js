import React, {PropTypes} from 'react'
import {Button} from 'react-bootstrap'

import Path from '../../utils/path'
import i18n from '../../utils/i18n'
import ParentLink from './parent-link'

const LinkButtons = ({gateway, path}) => {
  return (
    <div className='link-buttons'>
      <ParentLink parent={path.parent()} />

      <Button
          bsStyle='info'
          className='btn-second'
          href={gateway + path}
          target='_blank'
      >
        {i18n.t('RAW')}
      </Button>
      <Button
          className='btn-second'
          href={gateway + path + '?dl=1'}
          target='_blank'
        >
        {i18n.t('Download')}
      </Button>
    </div>
  )
}

LinkButtons.propTypes = {
  gateway: PropTypes.string.isRequired,
  path: PropTypes.instanceOf(Path).isRequired
}

export default LinkButtons

import React, {PropTypes} from 'react'

import Path from '../../utils/path'
import i18n from '../../utils/i18n'
import ParentLink from './parent-link'

const LinkButtons = ({gateway, path}) => {
  return (
    <div className='link-buttons'>
      <ParentLink parent={path.parent()} />
      <a
          href={gateway + path}
          target='_blank'
          className='btn btn-info btn-second'
      >
        {i18n.t('RAW')}
      </a>
      <a
          href={gateway + path + '?dl=1'}
          target='_blank'
          className='btn btn-second'>
        {i18n.t('Download')}
      </a>
    </div>
  )
}

LinkButtons.propTypes = {
  gateway: PropTypes.string.isRequired,
  path: PropTypes.instanceOf(Path).isRequired
}

export default LinkButtons

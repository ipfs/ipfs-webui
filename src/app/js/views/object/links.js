import React, {PropTypes} from 'react'

import Path from '../../utils/path'
import i18n from '../../utils/i18n'
import ObjectLinks from './object-links'

const Links = ({path, links}) => {
  if (!links || links.length < 1) {
    return (
      <div className='padded'>
        <strong>{i18n.t('This object has no links')}</strong>
      </div>
    )
  }

  return <ObjectLinks path={path} links={links} />
}

Links.propTypes = {
  path: PropTypes.instanceOf(Path).isRequired,
  links: PropTypes.array
}

export default Links

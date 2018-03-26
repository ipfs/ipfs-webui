import React from 'react'
import PropTypes from 'prop-types'
import {Table} from 'react-bootstrap'

import Path from '../../utils/path'
import i18n from '../../utils/i18n'
import ObjectLink from './object-link'

const ObjectLinks = ({path, links}) => {
  return (
    <div>
      <li className='list-group-item'>
        <strong>{i18n.t('Object links')}</strong>
      </li>
      <Table responsive className='filelist'>
        <thead>
          <tr>
            <th>{i18n.t('Name')}</th>
            <th>{i18n.t('Hash')}</th>
            <th>{i18n.t('Size')}</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => <ObjectLink path={path} link={link} />)}
        </tbody>
      </Table>
    </div>
  )
}

ObjectLinks.propTypes = {
  path: PropTypes.instanceOf(Path).isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({
    multihash: PropTypes.instanceOf(Buffer).isRequired,
    size: PropTypes.number.isRequired,
    name: PropTypes.string
  })).isRequired
}

export default ObjectLinks

import React, {PropTypes} from 'react'
import {join} from 'path'
import {Link} from 'react-router'

import Path, {parse} from '../../utils/path'

const ObjectLink = ({path, link}) => {
  let url = link.Name ? path.append(link.Name) : parse(link.Hash)
  url = url.urlify()
  url = join('objects', url)

  return (
    <tr>
      <td>
        <Link to={url}>
          {link.Name}
        </Link>
      </td>
      <td>
        <Link to={url}>
        {link.Hash}
        </Link>
      </td>
      <td>{link.Size}</td>
    </tr>
  )
}

ObjectLink.propTypes = {
  path: PropTypes.instanceOf(Path).isRequired,
  link: PropTypes.shape({
    Hash: PropTypes.string.isRequired,
    Size: PropTypes.number.isRequired,
    Name: PropTypes.string
  }).isRequired
}

export default ObjectLink

import React, {PropTypes} from 'react'
import {join} from 'path'
import {Link} from 'react-router'
import mh from 'multihashes'

import Path, {parse} from '../../utils/path'

const ObjectLink = ({path, link}) => {
  let hash = mh.toB58String(link.multihash)
  let url = link.name ? path.append(link.name) : parse(hash)

  url = url.urlify()
  url = join('objects', url)

  return (
    <tr>
      <td><Link to={url}>{link.name}</Link></td>
      <td><Link to={url}>{hash}</Link></td>
      <td>{link.size}</td>
    </tr>
  )
}

ObjectLink.propTypes = {
  path: PropTypes.instanceOf(Path).isRequired,
  link: PropTypes.shape({
    multihash: PropTypes.instanceOf(Buffer).isRequired,
    size: PropTypes.number.isRequired,
    name: PropTypes.string
  }).isRequired
}

export default ObjectLink

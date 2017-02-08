import React, {PropTypes, Component} from 'react'

import i18n from '../utils/i18n'
import Path from '../utils/path'

import PermaLink from './object/perma-link'
import DisplayData from './object/display-data'
import LinkButtons from './object/link-buttons'
import Links from './object/links'

export
default class ObjectView extends Component {
  static propTypes = {
    path: PropTypes.instanceOf(Path).isRequired,
    permalink: PropTypes.instanceOf(Path),
    gateway: PropTypes.string.isRequired,
    object: PropTypes.shape({
      data: PropTypes.string,
      links: PropTypes.array
    }).isRequired
  };

  render () {
    const { object, path, permalink, gateway } = this.props

    return (
      <div className='webui-object'>
        <div className='row'>
          <h4>{i18n.t('Object')}</h4>
          <LinkButtons gateway={gateway} path={path} />
          <br />
          <div className='panel panel-default'>
            <ul className='list-group'>
              <Links path={path} links={object.links} />
              <DisplayData data={object.data} />
            </ul>
          </div>
          <PermaLink url={permalink} />
        </div>
      </div>
    )
  }
}

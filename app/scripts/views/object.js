import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'

import i18n from '../utils/i18n'
import Icon from './icon'
import RawData from './object/raw-data'
import ObjectLinks from './object/object-links'

const ParentLink = ({parent}) => {
  if (!parent) return <span></span>

  return (
    <Link className='btn btn-primary' to={`/objects/${parent.urlify()}`}>
      <Icon glyph='arrow-up' /> {i18n.t('Parent object')}
    </Link>
  )
}

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

const Permalink = ({url}) => {
  if (!url) return <span></span>

  return (
    <li className='list-group-item'>
      <span>{i18n.t('permalink:')}</span>
      <Link to={`/objects/${url.urlify()}`}>
        {url.toString()}
      </Link>
    </li>
  )
}

const DisplayData = ({size, data}) => {
  if (!size) {
    return (
      <li className='list-group-item'>
        <strong>{i18n.t('This object has no data')}</strong>
      </li>
    )
  }

  return (
    <div>
      <li key='data-0' className='list-group-item'>
        <p>
          <strong>
            {i18n.t('Object data (%s bytes)', {
              postProcess: 'sprintf',
              sprintf: [size] })
            }
          </strong>
        </p>
      </li>
      <li key='data-1' className='list-group-item data'>
        <RawData data={data} />
      </li>
    </div>
  )
}

export default class ObjectView extends Component {
  static propTypes = {
    path: PropTypes.object,
    permalink: PropTypes.object,
    gateway: PropTypes.string,
    object: PropTypes.object,
    loadPeers: PropTypes.func
  }

  render () {
    const {object, path, permalink} = this.props
    const size = object.Data.length - 2
    const parent = path.parent()

    return (
      <div className='webui-object'>
        <div className='row'>
          <h4>{i18n.t('Object')}</h4>
          <div className='link-buttons'>
            <ParentLink parent={parent} />
            <a
                href={this.props.gateway + this.props.path}
                target='_blank'
                className='btn btn-info btn-second'
            >
              {i18n.t('RAW')}
            </a>
            <a
                href={this.props.gateway + this.props.path + '?dl=1'}
                target='_blank'
                className='btn btn-second'>
              {i18n.t('Download')}
            </a>
          </div>
          <br/>
          <div className='panel panel-default'>
            <ul className='list-group'>
              <Links path={path} links={object.Links} />
              <DisplayData size={size} data={this.props.object.Data}/>
            </ul>
          </div>
          <Permalink url={permalink} />
        </div>
      </div>
    )
  }
}

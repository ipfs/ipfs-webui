import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import {Table} from 'react-bootstrap'
import {join} from 'path'

import {parse} from '../utils/path'
import i18n from '../utils/i18n'
import Icon from './icon'

const RawData = ({data, limit = 10000}) => {
  const buf = new Buffer(data.substr(0, limit), 'utf-8')
  const content = `data:text/plain;charset=utf8;base64,${buf.toString('base64')}`

  return (
    <iframe src={content} className='panel-inner'></iframe>
  )
}

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
        {links.map(link => <ObjectLink key={link.Hash} path={path} link={link} />)}
      </tbody>
    </Table>
    </div>
  )
}

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

import React, {Component, PropTypes} from 'react'
import _ from 'lodash'

import Icon from '../../views/icon'

class Breadcrumb extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired
  };

  _onClick = (event) => {
    this.props.onClick(this.props.path)
  };

  render () {
    return (
      <a
        onClick={this._onClick}
        className='crumb-link'>
        {this.props.text}
      </a>
    )
  }
}

export default class Breadcrumbs extends Component {
  static propTypes = {
    files: PropTypes.array.isRequired,
    root: PropTypes.string,
    setRoot: PropTypes.func.isRequired
  };

  static defaultProps = {
    root: '/'
  };

  render () {
    const {root} = this.props
    const parts = {}
    const partsList = _.compact(root.split('/'))
    partsList.map((part, i) => {
      if (i === partsList.length - 1) {
        parts[part] = null
      } else {
        parts[part] = '/' + partsList.slice(0, i + 1).join('/')
      }
    })

    const breadcrumbs = _(parts)
            .map((root, part) => {
              if (!root) {
                return [
                  <Icon key='last-0' glyph='angle-right' />,
                  <span key='last-1'>{part}</span>
                ]
              }

              return [
                <Icon key={`${root}-0`} glyph='angle-right' />,
                <Breadcrumb
                  path={root}
                  onClick={this.props.setRoot}
                  text={part}/>
              ]
            })
            .flatten()
            .value()

    if (_.isEmpty(partsList)) {
      breadcrumbs.unshift(
        <span key='-1'>IPFS</span>
      )
    } else {
      breadcrumbs.unshift(
        <Breadcrumb
          path='/'
          onClick={this.props.setRoot}
          text='IPFS'/>
      )
    }

    return (
      <div className='breadcrumbs'>
        {breadcrumbs}
      </div>
    )
  }
}

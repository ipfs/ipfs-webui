import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {chain, isEmpty, compact} from 'lodash-es'
import {join} from 'path'

import Icon from '../../components/icon'

class Breadcrumb extends Component {
  _onClick = (event) => {
    const {history, path} = this.props

    history.push(join('/files/explorer/', path))
  }

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

Breadcrumb.propTypes = {
  path: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  text: PropTypes.string.isRequired
}

class Breadcrumbs extends Component {
  render () {
    const {root, history} = this.props
    const parts = []
    const partsList = compact(root.split('/'))

    partsList.map((part, i) => {
      if (i === partsList.length - 1) {
        parts[i] = {
          name: part,
          path: null
        }
      } else {
        parts[i] = {
          name: part,
          path: '/' + partsList.slice(0, i + 1).join('/')
        }
      }
    })

    const breadcrumbs = chain(parts)
      .map((info, index) => {
        if (!info.path) {
          return [
            <Icon key='last-0' glyph='angle-right' />,
            <span key='last-1'>{info.name}</span>
          ]
        }

        return [
          <Icon key={`${info.path}-0`} glyph='angle-right' />,
          <Breadcrumb
            key={`${info.path}-1`}
            path={info.path}
            history={history}
            text={info.name} />
        ]
      })
      .flatten()
      .value()

    if (isEmpty(partsList)) {
      breadcrumbs.unshift(
        <span key='-1'>IPFS</span>
      )
    } else {
      breadcrumbs.unshift(
        <Breadcrumb
          key='-2'
          path='/'
          history={history}
          text='IPFS' />
      )
    }

    return (
      <div className='breadcrumbs'>
        {breadcrumbs}
      </div>
    )
  }
}

Breadcrumbs.propTypes = {
  root: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
}

Breadcrumbs.defaultProps = {
  root: '/'
}

export default Breadcrumbs

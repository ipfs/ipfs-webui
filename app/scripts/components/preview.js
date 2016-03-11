import React, {Component, PropTypes} from 'react'
import {findKey, includes} from 'lodash-es'
import Highlight from 'react-syntax-highlighter'

import languages from '../constants/languages'

function getExtension (name) {
  name = name.toLowerCase()

  const i = name.lastIndexOf('.')
  return name.substring(i + 1)
}

function getLanguage (name) {
  const ext = getExtension(name)
  const lang = findKey(languages, (l) => {
    return includes(l, ext)
  })

  if (lang) return lang
  return 'diff'
}
const renderers = {
  image (name, content) {
    const ext = getExtension(name)
    const blob = new Blob([content], {type: `image/${ext}`})
    const urlCreator = window.URL || window.webkitURL
    const imageUrl = urlCreator.createObjectURL(blob)

    return (
      <img alt={name} src={imageUrl}/>
    )
  },

  default (name, content) {
    return (
      <Highlight language={getLanguage(name)} stylesheet='github-gist'>
        {content.toString('utf8')}
      </Highlight>
    )
  }
}

const types = {
  image: ['jpg', 'jpeg', 'png', 'gif']
}

function getType (ext) {
  const type = findKey(types, (t) => {
    return includes(t, ext)
  })

  if (type) return type
  return 'default'
}

function getRenderer (name) {
  const ext = getExtension(name)
  const type = getType(ext)

  return renderers[type]
}

function render (name, content) {
  return getRenderer(name)(name, content)
}

export default class Preview extends Component {
  static propTypes = {
    name: PropTypes.string,
    content: PropTypes.instanceOf(Buffer)
  };

  render () {
    if (!this.props.content) {
      return (
        <div className='preview loading'>Loading</div>
      )
    }

    return (
      <div className='preview'>
        {render(this.props.name, this.props.content)}
      </div>
    )
  }
}

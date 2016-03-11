import React, {Component, PropTypes} from 'react'
import {findKey, includes} from 'lodash-es'
import Highlight from 'react-syntax-highlighter'
import isBinary from 'is-binary'
import Video from 'react-html5video'

import 'react-html5video/dist/ReactHtml5Video.css'

import {api} from '../services'
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
  image (name, stats, load) {
    return load(name)
      .then((content) => {
        const ext = getExtension(name)
        const blob = new Blob([content], {type: `image/${ext}`})
        const urlCreator = window.URL || window.webkitURL
        const imageUrl = urlCreator.createObjectURL(blob)

        return (
          <img alt={name} src={imageUrl}/>
        )
      })
  },

  video (name, stats, load) {
    const src = `http://localhost:8080/ipfs/${stats.Hash}`
    const ext = getExtension(name)
    const type = `video/${ext}`
    return Promise.resolve(
      <Video controls>
        <source src={src} type={type} />
      </Video>
    )
  },

  default (name, stats, load) {
    const cantPreview = (
      <div className='no-preview'>
        Sorry, we can not preview <code>{name}</code>.
      </div>
    )

    if (stats.size > 1024 * 1024 * 4) {
      return Promise.resolve(cantPreview)
    }

    return load(name)
      .then((content) => {
        if (isBinary(content.toString('utf8'))) {
          return cantPreview
        }

        return (
          <Highlight language={getLanguage(name)} stylesheet='github-gist'>
            {content.toString('utf8')}
          </Highlight>
        )
      })
  }
}

const types = {
  image: ['jpg', 'jpeg', 'png', 'gif'],
  video: ['mp4', 'mov', 'avi']
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

function render (name, stats, load) {
  return getRenderer(name)(name, stats, load)
}

export default class Preview extends Component {
  static propTypes = {
    name: PropTypes.string,
    stats: PropTypes.object
  };

  state = {
    content: null
  };

  _load = (name) => {
    return api.files.read(name)
  };

  componentWillReceiveProps ({name, stats}) {
    if (name && stats) {
      render(name, stats, this._load)
        .then((content) => {
          this.setState({content})
        })
    }
  };

  render () {
    if (!this.state.content) {
      return (
        <div className='preview loading'>Loading</div>
      )
    }

    return (
      <div className='preview'>
        {this.state.content}
      </div>
    )
  }
}

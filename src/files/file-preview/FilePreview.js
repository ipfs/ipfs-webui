import React from 'react'
import PropTypes from 'prop-types'
import isBinary from 'is-binary'
import fileExtension from 'file-extension'
import typeFromExt from '../type-from-ext'

class FilesPreview extends React.Component {
  static propTypes = {
    stats: PropTypes.object.isRequired,
    gatewayUrl: PropTypes.string.isRequired,
    read: PropTypes.func.isRequired,
    content: PropTypes.object
  }

  state = {
    content: null
  }

  loadContent () {
    this.props.read()
      .then(buf => {
        this.setState({ content: buf.toString('utf-8') })
      })
  }

  render () {
    const {stats, gatewayUrl} = this.props

    const type = typeFromExt(stats.name)
    const src = `${gatewayUrl}/ipfs/${stats.hash}`
    const ext = fileExtension(stats.name)
    const className = 'w-100 bg-snow-muted pa2 br2'
    switch (type) {
      case 'audio':
        return (
          <audio width='100%' controls>
            <source src={src} type={`audio/${ext}`} />
          </audio>
        )
      case 'pdf':
        return (
          <object width='100%' height='500px' data={src} type='application/pdf'>
            If you're seeing this, is because your browser doesn't support previwing
            PDF files.
          </object>
        )
      case 'video':
        return (
          <video controls className={className}>
            <source src={src} type={`video/${ext}`} />
          </video>
        )
      case 'image':
        return <img className={className} alt={stats.name} src={src} />
      default:
        const cantPreview = (
          <div>
            Sorry, we can not preview this file..
          </div>
        )

        if (stats.size > 1024 * 1024 * 4) {
          return cantPreview
        }

        if (!this.state.content) {
          this.loadContent()
          return <div>Loading</div>
        }

        if (isBinary(this.state.content)) {
          return cantPreview
        }

        return (
          <pre className={`${className} overflow-auto monospace`}>
            {this.state.content}
          </pre>
        )
    }
  }
}

export default FilesPreview

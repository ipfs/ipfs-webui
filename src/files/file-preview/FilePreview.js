import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import isBinary from 'is-binary'
import { Trans, translate } from 'react-i18next'
import typeFromExt from '../type-from-ext'
import ComponentLoader from '../../loader/ComponentLoader.js'

class Preview extends React.Component {
  state = {
    content: null
  }

  async loadContent () {
    const buf = await this.props.read()
    this.setState({ content: buf.toString('utf-8') })
  }

  render () {
    const { t, name, hash, size, gatewayUrl } = this.props

    const type = typeFromExt(name)
    const src = `${gatewayUrl}/ipfs/${hash}`
    const className = 'mw-100 mt3 bg-snow-muted pa2 br2'

    switch (type) {
      case 'audio':
        return (
          <audio width='100%' controls>
            <source src={src} />
          </audio>
        )
      case 'pdf':
        return (
          <object width='100%' height='500px' data={src} type='application/pdf'>
            {t('noPDFSupport')}
            <a href={src} download target='_blank' rel='noopener noreferrer' className='underline-hover navy-muted'>{t('downloadPDF')}</a>
          </object>
        )
      case 'video':
        return (
          <video controls className={className}>
            <source src={src} />
          </video>
        )
      case 'image':
        return <img className={className} alt={name} src={src} />
      default:
        const cantPreview = (
          <div className='mt4'>
            <p className='b'>{t('cantBePreviewed')} <span role='img' aria-label='sad'>😢</span></p>
            <p>
              <Trans i18nKey='downloadInstead'>
                Try <a href={src} download target='_blank' rel='noopener noreferrer' className='link blue' >downloading</a> it instead.
              </Trans>
            </p>
          </div>
        )

        if (size > 1024 * 1024 * 4) {
          return cantPreview
        }

        if (!this.state.content) {
          this.loadContent()
          return <ComponentLoader pastDelay />
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

Preview.propTypes = {
  name: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  gatewayUrl: PropTypes.string.isRequired,
  read: PropTypes.func.isRequired,
  content: PropTypes.object,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

export default connect(
  'selectGatewayUrl',
  translate('files')(Preview)
)

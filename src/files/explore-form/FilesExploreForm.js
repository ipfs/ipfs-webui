import React from 'react'
import * as isIPFS from 'is-ipfs'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import StrokeFolder from '../../icons/StrokeFolder.js'
import StrokeIpld from '../../icons/StrokeIpld.js'
import Button from '../../components/button/Button.js'
import './FilesExploreForm.css'

class FilesExploreForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      path: '',
      hideExplore: false
    }
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onBrowse = this.onBrowse.bind(this)
    this.onInspect = this.onInspect.bind(this)
  }

  onKeyDown (evt) {
    if (evt.key === 'Enter') {
      this.onBrowse(evt)
    }
  }

  onBrowse (evt) {
    evt.preventDefault()

    if (this.isValid) {
      let path = this.path

      if (isIPFS.cid(path)) {
        path = `/ipfs/${path}`
      }

      this.props.onBrowse({ path })
      this.setState({ path: '' })
    }
  }

  onInspect (evt) {
    evt.preventDefault()

    if (this.isValid) {
      this.props.onInspect(this.path)
      this.setState({ path: '' })
    }
  }

  onChange (evt) {
    const path = evt.target.value
    this.setState({ path })
  }

  get path () {
    return this.state.path.trim()
  }

  get isValid () {
    return this.path !== '' && (isIPFS.cid(this.path) || isIPFS.path(this.path))
  }

  get inputClass () {
    if (this.path === '') {
      return 'focus-outline'
    }

    if (this.isValid) {
      return 'b--green-muted focus-outline-green'
    } else {
      return 'b--red-muted focus-outline-red'
    }
  }

  render () {
    const { t } = this.props
    return (
      <div data-id='FilesExploreForm' className='sans-serif black-80 flex'>
        <div className='flex-auto'>
          <div className='relative'>
            <input id='ipfs-path' className={`input-reset bn pa2 mb2 db w-100 f6 br-0 placeholder-light ${this.inputClass}`} style={{ borderRadius: '3px 0 0 3px' }} type='text' placeholder='QmHash/bafyHash' aria-describedby='ipfs-path-desc' onChange={this.onChange} onKeyDown={this.onKeyDown} value={this.state.path} />
            <small id='ipfs-path-desc' className='o-0 absolute f6 black-60 db mb2'>Paste in a CID or IPFS path</small>
          </div>
        </div>
        <div className='flex flex-row-reverse mb2'>
          <Button
            minWidth={0}
            disabled={!this.isValid}
            title={t('app:actions.inspect')}
            style={{ borderRadius: '0 3px 3px 0' }}
            onClick={this.onInspect}
            bg='bg-teal'
            className='ExploreFormButton button-reset pv1 ph2 ba f7 fw4 white overflow-hidden tc' >
            <StrokeIpld style={{ height: '2em' }} className='dib fill-current-color v-mid' />
            <span className='ml2'>{t('app:actions.inspect')}</span>
          </Button>
          <Button
            minWidth={0}
            disabled={!this.isValid}
            style={{ borderRadius: '0' }}
            title={t('app:actions.browse')}
            onClick={this.onBrowse}
            className='ExploreFormButton button-reset pv1 ph2 ba f7 fw4 white bg-gray overflow-hidden tc' >
            <StrokeFolder style={{ height: '2em' }} className='dib fill-current-color v-mid' />
            <span className='ml2'>{t('app:actions.browse')}</span>
          </Button>
        </div>
      </div>
    )
  }
}

FilesExploreForm.propTypes = {
  t: PropTypes.func.isRequired,
  onInspect: PropTypes.func.isRequired,
  onBrowse: PropTypes.func.isRequired
}

export default withTranslation('files')(FilesExploreForm)

import React from 'react'
import isIPFS from 'is-ipfs'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import StrokeIpld from '../../icons/StrokeFolder'
import Button from '../../components/button/Button'

class FilesExploreForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      path: ''
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit (evt) {
    evt.preventDefault()

    if (this.canBrowse) {
      let path = this.path

      if (isIPFS.cid(path)) {
        path = `/ipfs/${path}`
      }

      this.props.onNavigate(path)
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
    return isIPFS.cid(this.path) || isIPFS.path(this.path)
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

  get canBrowse () {
    return this.path !== '' && this.isValid
  }

  render () {
    const { t } = this.props
    return (
      <form data-id='FilesExploreForm' className='sans-serif black-80 flex' onSubmit={this.onSubmit}>
        <div className='flex-auto'>
          <div className='relative'>
            <input id='ipfs-path' className={`input-reset bn pa2 mb2 db w-100 f6 br-0 placeholder-light ${this.inputClass}`} style={{ borderRadius: '3px 0 0 3px' }} type='text' placeholder='QmHash' aria-describedby='name-desc' onChange={this.onChange} value={this.state.path} />
            <small id='ipfs-path-desc' className='o-0 absolute f6 black-60 db mb2'>Paste in a CID or IPFS path</small>
          </div>
        </div>
        <div className='flex-none'>
          <Button
            type='submit'
            disabled={!this.canBrowse}
            style={{ borderRadius: '0 3px 3px 0' }}
            className='button-reset pv1 pl2 pr3 ba f7 fw4 white bg-aqua' >
            <StrokeIpld style={{ height: 24 }} className='dib fill-current-color v-mid' />
            <span className='ml2'>{t('exploreForm.explore')}</span>
          </Button>
        </div>
      </form>
    )
  }
}

FilesExploreForm.propTypes = {
  t: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired
}

export default withTranslation('files')(FilesExploreForm)

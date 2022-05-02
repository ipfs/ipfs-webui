/* eslint-disable space-before-function-paren */
import React from 'react'
import isIPFS from 'is-ipfs'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import './FilesExploreForm.css'

import RetroInput from '../../components/common/atoms/RetroInput'
import RetroButton from '../../components/common/atoms/RetroButton'
import RetroText from '../../components/common/atoms/RetroText'
import SearchIcon from '../../icons/retro/SearchIcon'
import InfoCirleIcon from '../../icons/retro/InfoCircle'
import GreenCircleIcon from '../../icons/retro/GreenCircleIcon'
import RetroGradientButton from '../../components/common/atoms/RetroGradientButton'

class FilesExploreForm extends React.Component {
  constructor(props) {
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

  onKeyDown(evt) {
    if (evt.key === 'Enter') {
      this.onBrowse(evt)
    }
  }

  onBrowse(evt) {
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

  onClickBtnBrowse = (evt) => {
    this.onBrowse(evt)
  }

  onInspect(evt) {
    evt.preventDefault()

    if (this.isValid) {
      this.props.onInspect(this.path)
      this.setState({ path: '' })
    }
  }

  onChange(evt) {
    const path = evt.target.value
    this.setState({ path })
  }

  get path() {
    return this.state.path.trim()
  }

  get isValid() {
    return this.path !== '' && (isIPFS.cid(this.path) || isIPFS.path(this.path))
  }

  get inputBorder() {
    if (this.path === '') {
      return undefined
    }

    if (this.isValid) {
      return '1px solid #8476bb'
    } else {
      return '1px solid #fa5050'
    }
  }

  render() {
    const { t } = this.props
    return (
      <div data-id='FilesExploreForm' className='sans-serif flex'>
        <div className='flex-auto files-explore-form-input-container'>
          <div className='relative'>
            <RetroInput
              leftIcon={<SearchIcon />}
              height='40px'
              border={this.inputBorder}
              placeholder='QmHash/bafyHash'
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              rightButton={
                <RetroGradientButton
                  width={'100px'}
                  height='32px'
                  onClick={this.onClickBtnBrowse}
                >
                  Browse
                </RetroGradientButton>}
              value={this.state.path} />
            <small id='ipfs-path-desc' className='o-0 absolute f6 black-60 db mb2'>Paste in a CID or IPFS path</small>
          </div>
        </div>
        <div className='files-explore-form-buttons flex flex-row-reverse'>
          <RetroButton minHeight='28px' border='none' height='40px' style={{ marginLeft: '1px' }} disabled={!this.isValid} onClick={this.onInspect}>
            <RetroText color={!this.isValid ? '#9C9C9C' : '#000'} textTransform='capitalize'>
              {t('satus:active')}
            </RetroText>
            <GreenCircleIcon />
          </RetroButton>
          <div className='retro-h-divider' style={{ height: 30, margin: 'auto' }}></div>
          <RetroButton minHeight='28px' border='none' height='40px' style={{ marginLeft: '1px' }} disabled={!this.isValid} onClick={this.onBrowse}>
            <RetroText color={!this.isValid ? '#9C9C9C' : '#000'} textTransform='capitalize'>
              {t('satus:info')}
            </RetroText>
            <InfoCirleIcon />
          </RetroButton>
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

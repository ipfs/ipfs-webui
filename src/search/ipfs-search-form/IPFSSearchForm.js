import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import StrokeIpld from '../../icons/StrokeIpld'
import Button from '../../components/button/Button'
import './IPFSSearchForm.css'

class IPFSSearchForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      path: '',
      hideExplore: false
    }
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSearch = this.onSearch.bind(this)
  }

  onKeyDown (evt) {
    if (evt.key === 'Enter') {
      this.onSearch(evt)
    }
  }

  onSearch (evt) {
    evt.preventDefault()

    if (this.isValid) {
      this.props.onSearch(this.path)
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
    return this.path !== ''
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
      <div data-id='IPFSSearchForm' className='sans-serif black-80 flex'>
        <div className='flex-auto'>
          <div className='relative'>
            <input id='ipfs-search' className={`input-reset bn pa2 mb2 db w-100 f6 br-0 placeholder-light ${this.inputClass}`} style={{ borderRadius: '3px 0 0 3px' }} type='text' placeholder='Search Query' aria-describedby='ipfs-search-desc' onChange={this.onChange} onKeyDown={this.onKeyDown} value={this.state.path} />
            <small id='ipfs-search-desc' className='o-0 absolute f6 black-60 db mb2'>Enter a search query</small>
          </div>
        </div>
        <div className='flex flex-row-reverse mb2'>
          <Button
            minWidth={0}
            disabled={!this.isValid}
            title={t('app:actions.search')}
            style={{ borderRadius: '0 3px 3px 0' }}
            onClick={this.onSearch}
            bg='bg-teal'
            className='IPFSSearchFormButton button-reset pv1 ph2 ba f7 fw4 white overflow-hidden tc' >
            <StrokeIpld style={{ height: '2em' }} className='dib fill-current-color v-mid' />
            <span className='ml2'>{t('app:actions.search')}</span>
          </Button>
        </div>
      </div>
    )
  }
}

IPFSSearchForm.propTypes = {
  t: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired
}

export default withTranslation('search')(IPFSSearchForm)

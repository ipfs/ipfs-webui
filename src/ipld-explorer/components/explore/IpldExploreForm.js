import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import StrokeIpld from '../../icons/StrokeIpld'

class IpldExploreForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      path: ''
    }
    this.handleOnChange = this.handleOnChange.bind(this)
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
  }

  handleOnSubmit (evt) {
    evt.preventDefault()
    this.props.doExploreUserProvidedPath(this.state.path)
  }

  handleOnChange (evt) {
    const path = evt.target.value
    this.setState({ path })
  }

  render () {
    const { t } = this.props
    return (
      <form data-id='IpldExploreForm' className='sans-serif black-80 flex' onSubmit={this.handleOnSubmit}>
        <div className='flex-auto'>
          <div className='relative'>
            <input id='ipfs-path' className='input-reset bn pa2 mb2 db w-100 f6 br-0 placeholder-light focus-outline' style={{ borderRadius: '3px 0 0 3px' }} type='text' placeholder='QmHash' aria-describedby='name-desc' onChange={this.handleOnChange} value={this.state.path} />
            <small id='ipfs-path-desc' className='o-0 absolute f6 black-60 db mb2'>Paste in a CID or IPFS path</small>
          </div>
        </div>
        <div className='flex-none'>
          <button
            type='submit'
            className='button-reset dib lh-copy pv1 pl2 pr3 ba f7 fw4 focus-outline white bg-aqua bn'
            style={{ borderRadius: '0 3px 3px 0' }}
          >
            <StrokeIpld style={{ height: 24 }} className='dib fill-current-color v-mid' />
            <span className='ml2'>{t('IpldExploreForm.explore')}</span>
          </button>
        </div>
      </form>
    )
  }
}

export default connect(
  'doExploreUserProvidedPath',
  withTranslation('explore')(IpldExploreForm)
)

import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import StrokeIpld from '../../icons/StrokeFolder'

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
    this.props.doFilesExplorePath(this.state.path)
  }

  onChange (evt) {
    const path = evt.target.value
    this.setState({ path })
  }

  render () {
    const { t } = this.props
    return (
      <form data-id='FilesExploreForm' className='sans-serif black-80 flex' onSubmit={this.onSubmit}>
        <div className='flex-auto'>
          <div className='relative'>
            <input id='ipfs-path' className='input-reset bn pa2 mb2 db w-100 f6 br-0 placeholder-light focus-outline' style={{ borderRadius: '3px 0 0 3px' }} type='text' placeholder='QmHash' aria-describedby='name-desc' onChange={this.onChange} value={this.state.path} />
            <small id='ipfs-path-desc' className='o-0 absolute f6 black-60 db mb2'>Paste in a CID or IPFS path</small>
          </div>
        </div>
        <div className='flex-none'>
          <button
            type='submit'
            className='button-reset dib lh-copy pv1 pl2 pr3 ba f7 fw4 focus-outline white bg-aqua bn'
            style={{ borderRadius: '0 3px 3px 0' }}>
            <StrokeIpld style={{ height: 24 }} className='dib fill-current-color v-mid' />
            <span className='ml2'>{t('exploreForm.explore')}</span>
          </button>
        </div>
      </form>
    )
  }
}

export default connect(
  'doFilesExplorePath',
  translate('files')(FilesExploreForm)
)

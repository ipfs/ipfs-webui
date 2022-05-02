/* eslint-disable space-before-function-paren */
import React from 'react'
import classNames from 'classnames'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { humanSize } from '../../lib/files'
// Components
import FileInput from '../file-input/FileInput'
import FullGradientButton from '../../components/common/atoms/FullGradientButton'
import RetroText from '../../components/common/atoms/RetroText'

const BarOption = ({ children, text, isLink = false, className = '', ...etc }) => (
  <div className={classNames(className, 'tc pa3 ', etc.onClick && 'pointer')} {...etc}>

    <span className='nowrap db f6 spacegrotesk white '>{children}</span>
    <p className={`nowrap db spacegrotesk fw4 ${isLink ? 'link' : 'grayColor'}`} style={{ fontSize: '10px' }}>{text}</p>
  </div>
)

// Tweak human-readable size format to be more compact
const size = (s) => humanSize(s, {
  round: s >= 1073741824 ? 1 : 0, // show decimal > 1GiB
  spacer: ''
})

class SubHeader extends React.Component {
  handleContextMenu = (ev) => {
    const pos = this.dotsWrapper.getBoundingClientRect()
    this.props.handleContextMenu(ev, 'TOP', {
      ...this.props.files,
      // TODO: change to "pinning" and not "pinned"
      pinned: this.props.pins.includes(this.props.files.cid.toString())
    }, pos)
  }

  render() {
    const {
      currentDirectorySize,
      hasUpperDirectory,
      files,
      filesPathInfo,
      filesSize,
      repoSize,
      t
    } = this.props

    return (
      <div className='flex justify-between items-center joyride-files-add'>
        <div className='flex'>
          <BarOption title={t('filesDescription')} text={t('app:terms:files')} style={{ textTransform: 'capitalize' }}>
            {hasUpperDirectory
              ? (
                <span>
                  {size(currentDirectorySize)}<span> / {size(filesSize)}</span>
                </span>
              )
              : size(filesSize)}
          </BarOption>

          <BarOption title={t('allBlocksDescription')} text={t('allBlocks')} style={{ textTransform: 'capitalize' }}>
            {size(repoSize)}
          </BarOption>
        </div>

        <div className='pa3'>
          <div className='ml-auto flex items-center'>
            {(files && files.type === 'directory' && filesPathInfo.isMfs)
              ? <FileInput
                onNewFolder={this.props.onNewFolder}
                onAddFiles={this.props.onAddFiles}
                onAddByPath={this.props.onAddByPath}
                onCliTutorMode={this.props.onCliTutorMode}
              />
              : <div ref={el => { this.dotsWrapper = el }}>
                <FullGradientButton
                  className='f6 flex justify-center items-center'
                  // color='white'
                  height='38px'
                  // minWidth='100px'
                  active={this.props.isOpen}
                  disabled={!files || filesPathInfo.isRoot || files.type === 'unknown'}
                  onClick={this.handleContextMenu}>
                  <RetroText className='spacegrotesk white'>
                    {t('app:actions.more')}
                  </RetroText>
                </FullGradientButton>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  'selectPins',
  'selectHasUpperDirectory',
  'selectFilesSize',
  'selectRepoSize',
  'selectRepoNumObjects',
  'selectFilesPathInfo',
  'selectCurrentDirectorySize',
  withTranslation('files')(SubHeader)
)

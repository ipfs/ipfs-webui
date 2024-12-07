import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../../components/button/button.tsx'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal.js'
import { withTranslation } from 'react-i18next'
import * as isIPFS from 'is-ipfs'
import Icon from '../../../icons/StrokeDocument.js'
import { normalizeFiles } from '../../../lib/files.js'

class BulkImportModal extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onBulkCidImport: PropTypes.func.isRequired,
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  state = {
    // path: '',
    // name: '',
    selectedFile: null
  }

  validatePath = (p) => {
    if (!p.startsWith('/ipfs/')) {
      p = `/ipfs/${p}`
    }

    return isIPFS.ipfsPath(p)
  }

  onChange = (event) => {
    const files = event.target.files
    this.setState({ selectedFile: files[0] })
  }

  selectFile = async () => {
    return this.bulkCidInputt.click()
  }

  onSubmit = async () => {
    if (this.state.selectedFile) {
      const normalizedFiles = normalizeFiles([this.state.selectedFile])
      await this.props.onBulkCidImport(normalizedFiles)
    }
  }

  get inputClass () {
    if (this.state.path === '') {
      return ''
    }

    if (this.validatePath(this.state.path)) {
      return 'b--green-muted focus-outline-green'
    }

    return 'b--red-muted focus-outline-red'
  }

  get isDisabled () {
    return !this.state.selectedFile
  }

  render () {
    const {
      t, tReady, onCancel, onSubmit, className, ...props
    } = this.props

    const codeClass = 'w-100 mb1 pa1 tl bg-snow f7 charcoal-muted truncate'

    return (
      <Modal {...props} className={className} onCancel={onCancel}>
        <ModalBody title={'Bulk Import with Text File'} Icon={Icon}>
          <div className='mb3 flex flex-column items-center'>
            <p className='mt0 charcoal tl w-100'>{'Upload a text file with a list of CIDs (names are optional).' + ' ' + 'Example:'}</p>
            <code className={codeClass}>bafkreibm6jg3ux5qumhcn2b3flc3tyu6dmlb4xa7u5bf44yegnrjhc4yeq<br/>QmawceGscqN4o8Y8Fv26UUmB454kn2bnkXV5tEQYc4jBd6 barrel.png<br/>QmbvrHYWXAU1BuxMPNRtfeF4DS2oPmo5hat7ocqAkNPr74 pi equals.png</code>
          </div>

          <input
            type='file'
            className='dn'
            multiple
            accept='.txt'
            onChange={this.onChange}
            // className='input-reset'
            // id='bulk-import'
            ref={el => {
              console.log('Setting ref:', el)
              this.bulkCidInputt = el
            }}
          />
          <Button
            onClick={this.selectFile}
            className='ma2 tc'
            bg='bg-teal'
            type='button'
          >
            {'Select File'}
          </Button>
          {this.state.selectedFile && (
            <p className='mt2 charcoal'>
              Selected file: {this.state.selectedFile.name}
            </p>
          )}

          {/* <input
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.value}
            name='path'
            required
            placeholder={t('addByPathModal.importPathPlaceholder')}
            className={`input-reset charcoal ba b--black-20 br1 pa2 mb2 db w-90 center focus-outline ${this.inputClass}`}
            type='text' /> */}

        </ModalBody>

        <ModalActions>
          <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('actions.cancel')}</Button>
          <Button className='ma2 tc' bg='bg-teal' disabled={this.isDisabled} onClick={this.onSubmit}>{t('app:actions.import')}</Button>
        </ModalActions>
      </Modal>
    )
  }
}

export default withTranslation('files')(BulkImportModal)

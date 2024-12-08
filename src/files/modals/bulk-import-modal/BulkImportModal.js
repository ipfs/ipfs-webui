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
    selectedFile: null,
    validationError: null
  }

  validateFileContents = async (file) => {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      for (const line of lines) {
        const [cid] = line.trim().split(' ')
        if (!isIPFS.cid(cid)) {
          return { isValid: false, error: '*Invalid CID(s) found' }
        }
      }

      return { isValid: true }
    } catch (err) {
      return { isValid: false, error: '*Failed to read file contents' }
    }
  }

  onChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validation = await this.validateFileContents(file)
    this.setState({
      selectedFile: validation.isValid ? file : null,
      validationError: validation.error
    })
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

          {this.state.validationError && (
            <p className='mt2 red'>
              {this.state.validationError}
            </p>
          )}
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

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
    path: '',
    name: '',
    selectedFile: null
  }

  validatePath = (p) => {
    if (!p.startsWith('/ipfs/')) {
      p = `/ipfs/${p}`
    }

    return isIPFS.ipfsPath(p)
  }

  onChange = (event) => {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({ [name]: value })
  }

  handleFileSelect = (event) => {
    console.log('File select triggered', event)
    const file = event.target.files[0]
    this.setState({ selectedFile: file })
  }

  onBulkCidInputChange = (event) => async () => {
    console.log('event', event)
    console.log('event.files', event.files)
    // const input = event.target
    // console.log('Input element:', input)
    // console.log('Input files:', input?.files)
    // if (!input || !input.files) {
    //   console.error('Input or files not available')
    //   return
    // }
    this.props.onBulkCidImport(normalizeFiles(event))
    // input.value = null
  }

  onSubmit = () => {
    console.log('submit')
  }

  //   onSubmit = () => {
  //     let { path, name } = this.state
  //     if (this.validatePath(path)) {
  //       // avoid issues with paths by forcing a flat filename without leading/trailing spaces
  //       name = name.replaceAll('/', '_').trim()
  //       this.props.onSubmit(path, name)
  //     }
  //   }

  //   onKeyPress = (event) => {
  //     if (event.key === 'Enter') {
  //       this.onSubmit()
  //     }
  //   }

  get inputClass () {
    if (this.state.path === '') {
      return ''
    }

    if (this.validatePath(this.state.path)) {
      return 'b--green-muted focus-outline-green'
    }

    return 'b--red-muted focus-outline-red'
  }

  //   get isDisabled () {
  //     if (this.state.path === '') {
  //       return true
  //     }

  //     return !this.validatePath(this.state.path)
  //   }

  render () {
    const {
      t, onCancel, className
    } = this.props

    const codeClass = 'w-100 mb1 pa1 tl bg-snow f7 charcoal-muted truncate'

    return (
      <Modal className={className} onCancel={onCancel}>
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
            onChange={this.handleFileSelect}
            // className='input-reset'
            id='bulk-import'
            ref={el => {
              console.log('Setting ref:', el)
              this.bulkCidInput = el
            }}
            // onChange={this.onBulkCidInputChange(this.bulkCidInput)}
            // onChange={(e) => {
            //   console.log('onChange triggered, current ref:', this.bulkCidInput)
            //   console.log('onChange event:', e)
            //   console.log('onChange target:', e.target)
            //   console.log('onChange files:', e.target.files)
            //   this.onBulkCidInputChange(this.bulkCidInput)
            // }}
            // onChange={() => {
            //   // Make sure we're using the current ref
            //   console.log('onChange triggered, current ref:', this.bulkCidInput)
            //   this.onBulkCidInputChange(this.bulkCidInput)()
            // }}
          />
          <Button
            // onClick={() => {
            //   if (this.bulkCidInput) {
            //     this.bulkCidInput.click()
            //   }
            // }}
            onClick={(e) => {
              console.log('clicked')
              document.getElementById('bulk-import').click()
            }}
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
          <Button className='ma2 tc' bg='bg-teal' /* disabled={this.isDisabled} */ onClick={this.onBulkCidInputChange(this.bulkCidInput)}>{t('app:actions.import')}</Button>
        </ModalActions>
      </Modal>
    )
  }
}

export default withTranslation('files')(BulkImportModal)

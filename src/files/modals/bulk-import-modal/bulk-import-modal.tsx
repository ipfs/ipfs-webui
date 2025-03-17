import React, { useState, useRef } from 'react'
import Button from '../../../components/button/button.tsx'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/modal.js'
import { useTranslation } from 'react-i18next'
import * as isIPFS from 'is-ipfs'
import Icon from '../../../icons/stroke-document.js'
import { normalizeFiles } from '../../../lib/files.js'

const BulkImportModal = ({ onCancel, className = '', onBulkCidImport, ...props }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | undefined>(undefined)
  const bulkCidInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation('files')

  const validateFileContents = async (file) => {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      for (const line of lines) {
        const [cid] = line.trim().split(' ')
        if (!isIPFS.cid(cid)) {
          return { isValid: false, error: t('bulkImportModal.invalidCids') }
        }
      }

      return { isValid: true }
    } catch (err) {
      return { isValid: false, error: t('bulkImportModal.failedToReadFile') }
    }
  }

  const onChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validation = await validateFileContents(file)
    setSelectedFile(validation.isValid ? file : null)
    setValidationError(validation.error)
  }

  const selectFile = () => {
    if (bulkCidInputRef.current) {
      bulkCidInputRef.current.click()
    }
  }

  const onSubmit = async () => {
    if (selectedFile) {
      const normalizedFiles = normalizeFiles([selectedFile])
      await onBulkCidImport(normalizedFiles)
    }
  }

  const isDisabled = !selectedFile
  const codeClass = 'w-100 mb1 pa1 tl bg-snow f7 charcoal-muted truncate'

  return (
    <Modal {...props} className={className} onCancel={onCancel}>
      <ModalBody title={t('bulkImportModal.title')} Icon={Icon}>
        <div className='mb3 flex flex-column items-center'>
          <p className='mt0 charcoal tl w-100'>{t('bulkImportModal.description')}</p>
          <code className={codeClass}>bafkreibm6jg3ux5qumhcn2b3flc3tyu6dmlb4xa7u5bf44yegnrjhc4yeq<br />QmawceGscqN4o8Y8Fv26UUmB454kn2bnkXV5tEQYc4jBd6 barrel.png<br />QmbvrHYWXAU1BuxMPNRtfeF4DS2oPmo5hat7ocqAkNPr74 pi equals.png</code>
        </div>

        <input
          id='bulk-import'
          type='file'
          className='dn'
          multiple
          accept='.txt'
          ref={bulkCidInputRef}
          onChange={onChange}
        />
        <Button
          onClick={selectFile}
          className='ma2 tc'
          bg='bg-teal'
        >
          {t('bulkImportModal.select')}
        </Button>

        {selectedFile && (
          <p className='mt2 charcoal'>
            {`${t('bulkImportModal.selectedFile')}: ${selectedFile.name}`}
          </p>
        )}

        {validationError && (
          <p className='mt2 red'>
            {validationError}
          </p>
        )}
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-teal' disabled={isDisabled} onClick={onSubmit}>{t('app:actions.import')}</Button>
      </ModalActions>
    </Modal>
  )
}

export default BulkImportModal

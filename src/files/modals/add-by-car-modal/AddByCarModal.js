import React, { useMemo, useRef, useState } from 'react'
import { withTranslation } from 'react-i18next'
import Modal, { ModalActions, ModalBody } from '../../../components/modal/Modal'
import Icon from '../../../icons/StrokeData.js'
import Button from '../../../components/button/button'
import { normalizeFiles } from '../../../lib/files.js'

const AddByCarModal = ({ t, className, onCancel, onSubmit, ...props }) => {
  const fileInputRef = useRef(null)

  const [file, setFile] = useState()
  const [name, setName] = useState('')

  const onAddFileButtonClick = () => {
    if (fileInputRef) fileInputRef.current.click()
  }

  const onFileInputChange = (event) => {
    const files = normalizeFiles(event.target.files)

    if (files[0]) {
      const file = files[0]
      const fileName = files[0].path.replaceAll('.car', '')
      setFile(file)
      if (name.length === 0) {
        setName(fileName)
      }
    }
  }

  const onNameChange = (e) => {
    e.preventDefault()
    setName(e.target.value)
  }

  const onSubmitFile = () => {
    onSubmit(file, name)
  }

  const isFileNameValid = useMemo(() => {
    return name
  }, [name])

  const isDisabled = useMemo(() => {
    return !file || !isFileNameValid
  }, [file, isFileNameValid])

  const inputClass = useMemo(() => {
    if (!file) return
    if (isFileNameValid) {
      return 'b--green-muted focus-outline-green'
    } else {
      return 'b--red-muted focus-outline-red'
    }
  }, [isFileNameValid, file])

  return (
    <Modal className={className} onCancel={onCancel}>
      <ModalBody title={t('addByCarModal.title')} Icon={Icon}>
        <div className='mb3 flex flex-row items-center'>
          <p className='mt0 charcoal tl w-90'>{t('addByCarModal.description')}</p>
        </div>

        <input
          onChange={onNameChange}
          value={name}
          name='name'
          placeholder={t('addByCarModal.namePlaceholder')}
          className={`input-reset charcoal ba b--black-20 br1 pa2 db w-90 center focus-outline ${inputClass}`}
          type='text'
        />

        <input
          className='dn'
          ref={fileInputRef}
          id='car-file-input'
          type='file'
          placeholder='File'
          accept='.car'
          onChange={onFileInputChange}
        />
        <Button className='ma2 tc' bg='bg-teal' onClick={onAddFileButtonClick}>{t('addByCarModal.selectCARButtonText')}</Button>
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-teal' disabled={isDisabled} onClick={onSubmitFile}>{t('app:actions.import')}</Button>
      </ModalActions>
    </Modal>
  )
}

export default withTranslation('files')(AddByCarModal)

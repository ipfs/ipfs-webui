import React, { useMemo, useRef, useState } from 'react'
import { withTranslation } from 'react-i18next'
import Modal, { ModalActions, ModalBody } from '../../../components/modal/Modal'
import Icon from '../../../icons/StrokeDecentralization.js'
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
      const fileName = files[0].path
      setFile(files[0])
      setName(fileName)
    }
  }

  const onNameChange = (e) => {
    e.preventDefault()
    setName(e.target.value)
  }

  // TODO: Handling submit
  const onSubmitFile = () => {
    console.log('submitting file', file, file.path, name)
    // onSubmit()
  }

  const isValidated = useMemo(() => {
    return name.endsWith('.car')
  }, [name])

  const isDisabled = useMemo(() => {
    return !file || !isValidated
  }, [file, isValidated])

  const inputClass = useMemo(() => {
    if (!file) return
    if (isValidated) {
      return 'b--green-muted focus-outline-green'
    } else {
      return 'b--red-muted focus-outline-red'
    }
  }, [isValidated, file])

  return (
    <Modal className={className} onCancel={onCancel}>
      <ModalBody title='Add by CAR' Icon={Icon}>
        <div className='mb3 flex flex-row items-center'>
          <p className='mt0 charcoal tl w-90'>{t('addByCarModal.description') + ' ' + t('addByCarModal.examples')}</p>
        </div>

        <div className='flex flex-row justify-center'>
          <Button className='mr2' onClick={onAddFileButtonClick}>Add file</Button>
          <input
            onChange={onNameChange}
            value={name}
            name='name'
            placeholder={t('addByCarModal.namePlaceholder')}
            className={`input-reset charcoal ba b--black-20 br1 pa2 db w-90 center focus-outline ${inputClass}`}
            type='text'
          />
        </div>
        <input
          className='dn'
          ref={fileInputRef}
          id='file-input'
          type='file'
          placeholder='File'
          accept='.car'
          onChange={onFileInputChange}
        />
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-teal' disabled={isDisabled} onClick={onSubmitFile}>{t('app:actions.import')}</Button>
      </ModalActions>
    </Modal>
  )
}

export default withTranslation('files')(AddByCarModal)

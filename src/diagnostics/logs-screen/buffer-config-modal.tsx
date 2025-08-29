import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../../components/modal/modal'
import Overlay from '../../components/overlay/overlay'
import Button from '../../components/button/button'
import type { LogBufferConfig } from '../../contexts/logs/reducer'

interface BufferConfigModalProps {
  isOpen: boolean
  onClose: () => void
  currentConfig: LogBufferConfig
  onApply: (config: LogBufferConfig) => void
}

export const BufferConfigModal: React.FC<BufferConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onApply
}) => {
  const { t } = useTranslation('diagnostics')
  const [tempBufferConfig, setTempBufferConfig] = useState<LogBufferConfig>({ ...currentConfig })
  const [displayValues, setDisplayValues] = useState({
    memory: currentConfig.memory.toString(),
    indexedDB: currentConfig.indexedDB.toString(),
    warnThreshold: currentConfig.warnThreshold.toString(),
    autoDisableThreshold: currentConfig.autoDisableThreshold.toString()
  })

  // Update temp config when current config changes
  useEffect(() => {
    setTempBufferConfig({ ...currentConfig })
    setDisplayValues({
      memory: currentConfig.memory.toString(),
      indexedDB: currentConfig.indexedDB.toString(),
      warnThreshold: currentConfig.warnThreshold.toString(),
      autoDisableThreshold: currentConfig.autoDisableThreshold.toString()
    })
  }, [currentConfig])

  const handleApply = () => {
    // Parse display values and apply
    const configToApply = {
      memory: parseInt(displayValues.memory) || tempBufferConfig.memory,
      indexedDB: parseInt(displayValues.indexedDB) || tempBufferConfig.indexedDB,
      warnThreshold: parseInt(displayValues.warnThreshold) || tempBufferConfig.warnThreshold,
      autoDisableThreshold: parseInt(displayValues.autoDisableThreshold) || tempBufferConfig.autoDisableThreshold
    }
    onApply(configToApply)
    onClose()
  }

  const handleCancel = () => {
    // Reset to current config
    setTempBufferConfig({ ...currentConfig })
    setDisplayValues({
      memory: currentConfig.memory.toString(),
      indexedDB: currentConfig.indexedDB.toString(),
      warnThreshold: currentConfig.warnThreshold.toString(),
      autoDisableThreshold: currentConfig.autoDisableThreshold.toString()
    })
    onClose()
  }

  return (
    // @ts-expect-error - Overlay is not typed
    <Overlay show={isOpen} onLeave={handleCancel}>
      <Modal onCancel={handleCancel} className="outline-0">
        <div className='pa4'>
          <h3 className='montserrat fw4 charcoal ma0 f4 mb3'>{t('logs.config.title')}</h3>
          <div className='grid grid-cols-2 gap3 mb4'>
            <div>
              <label className='db fw6 mb1 f6'>{t('logs.config.memoryBuffer')}</label>
              <input
                type='number'
                className='input-reset ba b--black-20 pa2 w-100'
                value={displayValues.memory}
                onChange={(e) => {
                  const value = e.target?.value || ''
                  setDisplayValues(prev => ({ ...prev, memory: value }))
                }}
                min='100'
                max='2000'
              />
            </div>
            <div>
              <label className='db fw6 mb1 f6'>{t('logs.config.persistentBuffer')}</label>
              <input
                type='number'
                className='input-reset ba b--black-20 pa2 w-100'
                value={displayValues.indexedDB}
                onChange={(e) => {
                  const value = e.target?.value || ''
                  setDisplayValues(prev => ({ ...prev, indexedDB: value }))
                }}
                min='1000'
                max='100000'
              />
            </div>
            <div>
              <label className='db fw6 mb1 f6'>{t('logs.config.warnThreshold')}</label>
              <input
                type='number'
                className='input-reset ba b--black-20 pa2 w-100'
                value={displayValues.warnThreshold}
                onChange={(e) => {
                  const value = e.target?.value || ''
                  setDisplayValues(prev => ({ ...prev, warnThreshold: value }))
                }}
                min='10'
                max='1000'
              />
            </div>
            <div>
              <label className='db fw6 mb1 f6'>{t('logs.config.autoDisableThreshold')}</label>
              <input
                type='number'
                className='input-reset ba b--black-20 pa2 w-100'
                value={displayValues.autoDisableThreshold}
                onChange={(e) => {
                  const value = e.target?.value || ''
                  setDisplayValues(prev => ({ ...prev, autoDisableThreshold: value }))
                }}
                min='50'
                max='2000'
              />
            </div>
          </div>
          <div className='flex flex-column flex-row-ns justify-end'>
            <Button
              id='buffer-config-cancel-button'
              minWidth={100}
              bg='bg-charcoal'
              className='tc'
              onClick={handleCancel}
            >
              {t('logs.config.cancel')}
            </Button>
            <Button
              id='buffer-config-apply-button'
              minWidth={100}
              className='mt2 mt0-ns ml0 ml2-ns tc'
              onClick={handleApply}
            >
              {t('logs.config.apply')}
            </Button>
          </div>
        </div>
      </Modal>
    </Overlay>
  )
}

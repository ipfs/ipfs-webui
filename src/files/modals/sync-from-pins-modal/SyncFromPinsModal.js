import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { CID } from 'multiformats/cid'

import Checkbox from '../../../components/checkbox/Checkbox.js'
import Button from '../../../components/button/button.tsx'
import LoadingAnimation from '../../../components/loading-animation/LoadingAnimation.js'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/modal'
import GlyphPinCloud from '../../../icons/GlyphPinCloud.js'
import { humanSize } from '../../../lib/files.js'

const SyncFromPinsModal = ({ t, tReady, onCancel, onSync, pins, className, ...props }) => {
  const [selectedPins, setSelectedPins] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pinDetails, setPinDetails] = useState({})
  const [loadingDetails, setLoadingDetails] = useState(false)

  const loadPinDetails = useCallback(async () => {
    try {
      // This would need to be implemented in the actions to get pin details
      // For now, we'll use basic info
      const details = {}
      for (const pin of pins) {
        details[pin.toString()] = {
          cid: pin,
          name: `Pinned File ${pin.toString().substring(0, 8)}...`,
          size: 'Unknown',
          type: 'file'
        }
      }
      setPinDetails(details)
    } catch (error) {
      console.error('Error loading pin details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }, [pins])

  // Load pin details when component mounts
  useEffect(() => {
    if (pins && pins.length > 0) {
      setLoadingDetails(true)
      loadPinDetails()
    }
  }, [pins, loadPinDetails])

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPins(pins.map(pin => pin.toString()))
    } else {
      setSelectedPins([])
    }
  }

  const handleSelectPin = (pinCid, checked) => {
    if (checked) {
      setSelectedPins(prev => [...prev, pinCid])
    } else {
      setSelectedPins(prev => prev.filter(cid => cid !== pinCid))
    }
  }

  const handleSync = async () => {
    if (selectedPins.length === 0) return

    setIsLoading(true)
    try {
      await onSync(selectedPins)
    } catch (error) {
      console.error('Error syncing pins:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const allSelected = selectedPins.length === pins.length && pins.length > 0
  const someSelected = selectedPins.length > 0 && selectedPins.length < pins.length

  if (!tReady) {
    return <LoadingAnimation />
  }

  return (
    <Modal {...props} className={className} onCancel={onCancel}>
      <ModalBody title={t('syncFromPins.title')} Icon={GlyphPinCloud}>
        <div className='mb3 flex flex-column items-center'>
          <p className='mt0 charcoal tl w-100'>{t('syncFromPins.description')}</p>
          <p className='mt0 charcoal-muted tl w-100 f6'>{t('syncFromPins.note')}</p>
        </div>

        {loadingDetails
          ? (
            <div className='flex items-center justify-center pa3'>
              <LoadingAnimation />
              <span className='ml2 gray'>{t('loadingPinDetails')}</span>
            </div>
            )
          : (
            <div className='w-100'>
              <div className='flex items-center mb3'>
                <Checkbox
                  id='select-all-pins'
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                  className='mr2'
                />
                <label htmlFor='select-all-pins' className='f6 fw5 charcoal pointer'>
                  {t('selectAll')} ({pins.length} {t('pins')})
                </label>
              </div>

              <div className='max-h-40 overflow-y-auto ba b--light-gray br2'>
                {pins.map((pin, index) => {
                  const pinCid = pin.toString()
                  const details = pinDetails[pinCid]
                  const isSelected = selectedPins.includes(pinCid)

                  return (
                    <div key={pinCid} className='flex items-center pa3 bt b--light-gray'>
                      <Checkbox
                        id={`pin-${index}`}
                        checked={isSelected}
                        onChange={(checked) => handleSelectPin(pinCid, checked)}
                        className='mr3'
                      />
                      <div className='flex-auto'>
                        <div className='f6 fw5 charcoal truncate' title={details?.name || pinCid}>
                          {details?.name || `Pinned File ${pinCid.substring(0, 8)}...`}
                        </div>
                        <div className='f7 gray mt1'>
                          {details?.size && details.size !== 'Unknown' && (
                            <span className='mr3'>{humanSize(details.size)}</span>
                          )}
                          <span className='mono'>{pinCid.substring(0, 12)}...</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            )}
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel} disabled={isLoading}>
          {t('app:actions.cancel')}
        </Button>
        <Button
          className='ma2 tc'
          bg='bg-teal'
          disabled={selectedPins.length === 0 || isLoading}
          onClick={handleSync}
        >
          {isLoading ? t('syncing') : `Sync ${selectedPins.length} files`}
        </Button>
      </ModalActions>
    </Modal>
  )
}

SyncFromPinsModal.propTypes = {
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onSync: PropTypes.func.isRequired,
  pins: PropTypes.arrayOf(PropTypes.instanceOf(CID)).isRequired,
  className: PropTypes.string
}

export default withTranslation('files')(SyncFromPinsModal)

import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'redux-bundler-react'

// Components
import Button from '../button/Button'
import Overlay from '../overlay/Overlay'
import PinningModal from './pinning-manager-modal/PinningManagerModal'

const PinningManager = ({ t, pinningServices, doFilesSizeGet, doFilesFetch }) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const onModalOpen = () => setModalOpen(true)
  const onModalClose = () => setModalOpen(false)

  useEffect(() => {
    (async () => {
      await doFilesFetch()
      await doFilesSizeGet()
    })()
  })

  return (
    <Fragment>
      <div>
        <div className='ph4 flex items-center bg-white lh-copy charcoal f6 fw5'>
          { JSON.stringify(pinningServices) }
        </div>
        <div className='flex justify-end w-100'>
          <Button className="tc mt2" bg='bg-navy' onClick={onModalOpen}>
            <span><span className="aqua">+</span> {t('actions.addService')}</span>
          </Button>
        </div>
      </div>

      <Overlay show={isModalOpen} onLeave={onModalClose}>
        <PinningModal className='outline-0' onLeave={onModalClose} t={t} />
      </Overlay>
    </Fragment>
  )
}

export default connect(
  'doFilesFetch',
  'doFilesSizeGet',
  'selectPinningServices',
  PinningManager
)

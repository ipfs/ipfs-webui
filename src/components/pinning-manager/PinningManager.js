import React, { Fragment, useEffect, useState, useMemo, useRef } from 'react'
import { connect } from 'redux-bundler-react'
import { AutoSizer, Table, Column, SortDirection } from 'react-virtualized'
import { sortByProperty } from '../../lib/sort'

// Components
import Overlay from '../overlay/Overlay'
import PinningModal from './pinning-manager-modal/PinningManagerModal'
import AutoUploadModal from './auto-upload-modal/AutoUploadModal'
import ContextMenu from '../context-menu/ContextMenu'
import ContextMenuItem from '../context-menu/ContextMenuItem'

import RetroButton from '../common/atoms/RetroButton'
import RetroGradientButton from '../common/atoms/RetroGradientButton'

import RetroText from '../common/atoms/RetroText'
import OptionsIcon from '../../icons/retro/OptionsIcon'

import './PinningManager.css'

const ROW_HEIGHT = 50
const HEADER_HEIGHT = 32

export const PinningManager = ({ pinningServices, ipfsReady, arePinningServicesSupported, doFetchPinningServices, doPinsStatsGet, doRemovePinningService, pinsSize, numberOfPins, t }) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const [isToggleModalOpen, setToggleModalOpen] = useState(false)
  const onModalOpen = () => setModalOpen(true)
  const onModalClose = () => {
    const modalNode = document.getElementById('pinningmodal')
    if (modalNode) {
      modalNode.classList.add('translateY')
    }
    setTimeout(() => {
      setModalOpen(false)
    }, 500)
  }
  const onToggleModalOpen = (name) => setToggleModalOpen(name)
  const onToggleModalClose = () => setToggleModalOpen(false)

  const [sortSettings, setSortSettings] = useState({
    sortBy: 'addedAt',
    sortDirection: SortDirection.ASC
  })
  useEffect(() => {
    (async () => {
      try {
        ipfsReady && await doPinsStatsGet()
      } catch (e) {
        console.error('doPinsStatsGet error', e)
      }
    })()
  }, [doPinsStatsGet, ipfsReady])

  useEffect(() => {
    ipfsReady && doFetchPinningServices()
  }, [ipfsReady, doFetchPinningServices])

  const localPinning = useMemo(() =>
    ({ name: t('localPinning'), type: 'LOCAL', totalSize: pinsSize, numberOfPins }), [numberOfPins, pinsSize, t])

  const sortedServices = useMemo(() =>
    (pinningServices || []).sort(sortByProperty(sortSettings.sortBy, sortSettings.sortDirection === SortDirection.ASC ? 1 : -1)), [pinningServices, sortSettings.sortBy, sortSettings.sortDirection])

  const sortedList = useMemo(() => [localPinning, ...sortedServices], [localPinning, sortedServices])

  return (
    <Fragment>
      <div className="mv2 pinningManager border-bottom-purple pb3">
        <div className=' flex items-center lh-copy f6 fw5'>
          <AutoSizer disableHeight>
            {({ width }) => (
              <Table
                className='tl fw4 w-100 f6'
                headerClassName='ttc spacegrotesk fw4 f6 white-60 '
                width={width}
                height={(sortedList.length + 1) * ROW_HEIGHT}
                headerHeight={HEADER_HEIGHT}
                rowHeight={ROW_HEIGHT}
                rowCount={sortedList.length}
                rowGetter={({ index }) => sortedList[index]}
                rowClassName='mt2 spacegrotesk white'
                sort={(...sortArgs) => setSortSettings(...sortArgs)}
                sortBy={sortSettings.sortBy}
                sortDirection={sortSettings.sortDirection}>
                <Column label={t('service')} title={t('service')} dataKey='name' width={width * 0.4} flexShrink={0} flexGrow={1} cellRenderer={ServiceCell} className='truncate spacegrotesk f6' />
                {/* <Column label={t('size')} title={t('size')} dataKey='totalSize' width={width * 0.2} flexShrink={0} cellRenderer={({ rowData }) => <SizeCell rowData={rowData} t={t}/>} className='charcoal truncate f6 pl2' /> */}
                <Column label={t('pins')} title={t('pins')} dataKey='numberOfPins' width={width * 0.2} flexShrink={1} cellRenderer={({ rowData }) => <NumberOfPinsCell rowData={rowData} t={t} />} className='truncate spacegrotesk f6 pl2' />
                <Column label={t('autoUpload')} title={t('autoUpload')} dataKey='autoUpload' width={width * 0.2} flexShrink={1} cellRenderer={({ rowData }) => <AutoUploadCell autoUpload={rowData.autoUpload} type={rowData.type} name={rowData.name} visitServiceUrl={rowData.visitServiceUrl} doRemovePinningService={doRemovePinningService} t={t} onToggleModalOpen={onToggleModalOpen} />} className='pinningManagerColumn truncate spacegrotesk f6 pl2' />
              </Table>
            )}
          </AutoSizer>
        </div>
        {arePinningServicesSupported &&
          (<div className='flex justify-end w-100 mt2 '>
            <RetroGradientButton width='110px' height='38px' className="tc mt2" bg='bg-navy' onClick={onModalOpen}>
              <RetroText color='white' className='spacegrotesk'>{t('actions.addService')}</RetroText>
            </RetroGradientButton>
          </div>
          )}
      </div>

      <Overlay show={isToggleModalOpen} onLeave={onToggleModalClose}>
        <AutoUploadModal className='outline-0' onLeave={() => {
          onToggleModalClose()
          doFetchPinningServices()
        }} t={t} name={isToggleModalOpen} service={sortedServices.find(s => s.name === isToggleModalOpen)} />
      </Overlay>

      <Overlay show={isModalOpen} onLeave={onModalClose}>
        <PinningModal id='pinningmodal' className='outline-0 transBottomUp generic-modal spacegrotesk' onLeave={() => {
          onModalClose()
          doFetchPinningServices()
        }} t={t} />
      </Overlay>
    </Fragment>
  )
}

PinningManager.defaultProps = {
  pinningServices: []
}

const serviceOnline = (s) => (s.type === 'LOCAL' || s.online)

const ServiceCell = ({ rowData, rowIndex }) => (
  <div className='flex items-center' title={rowData.name}>
    <span className={serviceOnline(rowData) ? 'truncate' : 'truncate red'}>{rowData.name}</span>
  </div>
)

const NumberOfPinsCell = ({ rowData, t }) => {
  if (rowData.numberOfPins < 0) {
    return <div className='red help' title={t('errors.failedToFetchTitle')}>{t('errors.failedToFetch')}</div>
  }
  return <div className={rowData.numberOfPins >= 0 ? '' : 'gray'}>{rowData.numberOfPins >= 0 ? rowData.numberOfPins : `${(t('app:terms:loading'))}...`}</div>
}
const AutoUploadCell = ({ autoUpload, visitServiceUrl, name, doRemovePinningService, t, type, onToggleModalOpen }) => (
  <div className="flex justify-between items-center">
    <div className={!autoUpload ? 'gray' : ''}>{typeof autoUpload !== 'undefined' ? t('autoUploadPolicy.' + autoUpload) : '-'}</div>
    {type !== 'LOCAL' && <OptionsCell doRemovePinningService={doRemovePinningService} name={name} t={t} onToggleModalOpen={onToggleModalOpen} autoUpload={autoUpload} visitServiceUrl={visitServiceUrl} />}
  </div>
)

const OptionsCell = ({ doRemovePinningService, name, visitServiceUrl, autoUpload, t, onToggleModalOpen }) => {
  const buttonRef = useRef()
  const [isContextVisible, setContextVisibility] = useState(false)

  const handleRemove = () => {
    doRemovePinningService(name)
    setContextVisibility(false)
  }

  const showAutoUpload = !name.includes('.') // temporary mitigation for https://github.com/ipfs/ipfs-webui/issues/1770

  const RefButton = React.forwardRef((props, ref) => (
    <RetroButton buttonRef={ref} {...props}>
      {props.children}
    </RetroButton>
  ))

  return (
    <div>
      <RefButton className="button-inside-focus" onClick={() => setContextVisibility(true)} ref={buttonRef} aria-label={t('showOptions')}>
        <OptionsIcon />
      </RefButton>
      <ContextMenu className="" style={{ zIndex: 1001 }} visible={isContextVisible}
        target={buttonRef} onDismiss={() => setContextVisibility(false)} arrowAlign="right">
        {showAutoUpload && (
          <ContextMenuItem className='' onClick={() => onToggleModalOpen(name)}>
            <span className="f7">{autoUpload ? t('pinningServices.removeAutoUpload') : t('pinningServices.addAutoUpload')}</span>
          </ContextMenuItem>)
        }
        {visitServiceUrl && (
          <a className='link flex items-center' href={visitServiceUrl} target='_blank' rel='noopener noreferrer'>
            <ContextMenuItem className='w-100 black hover-white' onClick={() => setContextVisibility(false)}>
              <span className="f7">{t('visitService')}</span>
            </ContextMenuItem>
          </a>)
        }
        <ContextMenuItem className='' onClick={handleRemove}>
          <span className="f7">{t('remove')}</span>
        </ContextMenuItem>
      </ContextMenu>
    </div>

  )
}

export default connect(
  'doPinsStatsGet',
  'selectIpfsReady',
  'selectPinsSize',
  'selectNumberOfPins',
  'selectPinningServices',
  'selectArePinningServicesSupported',
  'doFetchPinningServices',
  'doRemovePinningService',
  PinningManager
)

import React, { Fragment, useEffect, useState, useMemo, useRef } from 'react'
import { connect } from 'redux-bundler-react'
import { AutoSizer, Table, Column, SortDirection } from 'react-virtualized'
import { sortByProperty } from '../../lib/sort.js'

// Components
import Button from '../button/Button.js'
import Overlay from '../overlay/Overlay.js'
import PinningModal from './pinning-manager-modal/PinningManagerModal.js'
import AutoUploadModal from './auto-upload-modal/AutoUploadModal.js'
import GlyphPin from '../../icons/GlyphPin.js'
import ContextMenu from '../context-menu/ContextMenu.js'
import ContextMenuItem from '../context-menu/ContextMenuItem.js'
import GlyphDots from '../../icons/GlyphDots.js'
import StrokeCancel from '../../icons/StrokeCancel.js'
import StrokeExternalLink from '../../icons/StrokeExternalLink.js'
import StrokeCloud from '../../icons/StrokeCloud.js'

import './PinningManager.css'

const ROW_HEIGHT = 50
const HEADER_HEIGHT = 32

export const PinningManager = ({ pinningServices, ipfsReady, arePinningServicesSupported, doFetchPinningServices, doFetchPinningServicesStats, doFetchLocalPinsStats, doRemovePinningService, localPinsSize, localNumberOfPins, t }) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const [isToggleModalOpen, setToggleModalOpen] = useState(false)
  const onModalOpen = () => setModalOpen(true)
  const onModalClose = () => setModalOpen(false)
  const onToggleModalOpen = (name) => setToggleModalOpen(name)
  const onToggleModalClose = () => setToggleModalOpen(false)

  const [sortSettings, setSortSettings] = useState({
    sortBy: 'addedAt',
    sortDirection: SortDirection.ASC
  })

  useEffect(() => {
    ipfsReady && doFetchPinningServices() && doFetchPinningServicesStats() && doFetchLocalPinsStats()
  }, [ipfsReady, doFetchPinningServices, doFetchPinningServicesStats, doFetchLocalPinsStats])

  const localPinning = useMemo(() =>
    ({ name: t('localPinning'), type: 'LOCAL', totalSize: localPinsSize, numberOfPins: localNumberOfPins }),
  [localNumberOfPins, localPinsSize, t])

  const sortedServices = useMemo(() =>
    (pinningServices || []).sort(sortByProperty(sortSettings.sortBy, sortSettings.sortDirection === SortDirection.ASC ? 1 : -1)),
  [pinningServices, sortSettings.sortBy, sortSettings.sortDirection])

  const sortedList = useMemo(() => [localPinning, ...sortedServices], [localPinning, sortedServices])
  return (
    <Fragment>
      <div className="mv4 pinningManager">
        <div className='ph1 ph3-l flex items-center bg-white lh-copy charcoal f6 fw5'>
          <AutoSizer disableHeight>
            {({ width }) => (
              <Table
                className='tl fw4 w-100 f6'
                headerClassName='gray ttc fw4 f6 ph2'
                width={width}
                height={(sortedList.length + 1) * ROW_HEIGHT}
                headerHeight={HEADER_HEIGHT}
                rowHeight={ROW_HEIGHT}
                rowCount={sortedList.length}
                rowGetter={({ index }) => sortedList[index]}
                rowClassName='bb b--light-gray mt2'
                sort={(...sortArgs) => setSortSettings(...sortArgs)}
                sortBy={sortSettings.sortBy}
                sortDirection={sortSettings.sortDirection}>
                <Column label={t('service')} title={t('service')} dataKey='name' width={width * 0.4} flexShrink={0} flexGrow={1} cellRenderer={ServiceCell} className='charcoal truncate f6' />
                {/* <Column label={t('size')} title={t('size')} dataKey='totalSize' width={width * 0.2} flexShrink={0} cellRenderer={({ rowData }) => <SizeCell rowData={rowData} t={t}/>} className='charcoal truncate f6 pl2' /> */}
                <Column label={t('pins')} title={t('pins')} dataKey='numberOfPins' width={width * 0.2} flexShrink={1} cellRenderer={({ rowData }) => <NumberOfPinsCell rowData={rowData} t={t}/>} className='charcoal truncate f6 pl2' />
                <Column label={t('autoUpload')} title={t('autoUpload')} dataKey='autoUpload' width={width * 0.2} flexShrink={1} cellRenderer={({ rowData }) => <AutoUploadCell autoUpload={rowData.autoUpload} type={rowData.type} name={rowData.name} visitServiceUrl={rowData.visitServiceUrl} doRemovePinningService={doRemovePinningService} t={t} onToggleModalOpen={onToggleModalOpen} />} className='pinningManagerColumn charcoal truncate f6 pl2' />
              </Table>
            )}
          </AutoSizer>
        </div>
        { arePinningServicesSupported &&
        (<div className='flex justify-end w-100 mt2'>
          <Button className="tc mt2" bg='bg-navy' onClick={onModalOpen}>
            <span><span className="aqua">+</span> {t('actions.addService')}</span>
          </Button>
        </div>
        )}
      </div>

      <Overlay show={isToggleModalOpen} onLeave={onToggleModalClose}>
        <AutoUploadModal className='outline-0' onLeave={() => {
          onToggleModalClose()
          doFetchPinningServices()
          doFetchPinningServicesStats()
        }} t={t} name={isToggleModalOpen} service={sortedServices.find(s => s.name === isToggleModalOpen)} />
      </Overlay>

      <Overlay show={isModalOpen} onLeave={onModalClose}>
        <PinningModal className='outline-0' onLeave={() => {
          onModalClose()
          doFetchPinningServices()
          doFetchPinningServicesStats()
        }} t={t} />
      </Overlay>
    </Fragment>
  )
}

PinningManager.defaultProps = {
  pinningServices: []
}

const serviceOnline = (s) => (s.type === 'LOCAL' || s.online)

const Icon = ({ rowData, index }) => {
  const colors = ['aqua', 'link', 'yellow', 'teal', 'red', 'green', 'navy', 'gray', 'charcoal']
  const color = colors[index % colors.length]
  const iconClass = `mr2 pr1 fill-${color} flex-shrink-0`

  if (rowData.icon) {
    return <img src={rowData.icon} alt={rowData.name} width="28" height="28" className={iconClass} style={{ objectFit: 'contain' }} />
  }
  return <GlyphPin width="28" height="28" className={iconClass} />
}

const ServiceCell = ({ rowData, rowIndex }) => (
  <div className='flex items-center' title={rowData.name}>
    <Icon rowData={rowData} index={rowIndex}/>
    <span className={serviceOnline(rowData) ? 'truncate' : 'truncate red'}>{ rowData.name }</span>
  </div>
)

// const SizeCell = ({ rowData, t }) => (
//   <p className={ !rowData.totalSize ? 'gray nowrap' : 'nowrap'}>{ !rowData.totalSize
//     ? `${(t('app:terms:loading'))}...`
//     : humanSize(rowData.totalSize || 0, {
//       round: rowData.totalSize >= 1073741824 ? 1 : 0, spacer: ''
//     })}</p>
// )
const NumberOfPinsCell = ({ rowData, t }) => {
  if (rowData.numberOfPins < 0) {
    return <div className='red help' title={t('errors.failedToFetchTitle')}>{t('errors.failedToFetch')}</div>
  }
  return <div className={rowData.numberOfPins >= 0 ? '' : 'gray'}>{rowData.numberOfPins >= 0 ? rowData.numberOfPins : `${(t('app:terms:loading'))}...`}</div>
}
const AutoUploadCell = ({ autoUpload, visitServiceUrl, name, doRemovePinningService, t, type, onToggleModalOpen }) => (
  <div className="flex justify-between items-center">
    <div className={!autoUpload ? 'gray' : ''}>{ typeof autoUpload !== 'undefined' ? t('autoUploadPolicy.' + autoUpload) : '-' }</div>
    { type !== 'LOCAL' && <OptionsCell doRemovePinningService={doRemovePinningService} name={name} t={t} onToggleModalOpen={onToggleModalOpen} autoUpload={autoUpload} visitServiceUrl={visitServiceUrl} /> }
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

  return (
    <div>
      <button className="button-inside-focus" onClick={() => setContextVisibility(true)} ref={buttonRef} aria-label={t('showOptions')}>
        <GlyphDots width={24} className='fill-gray-muted hover-fill-gray transition-all'/>
      </button>
      <ContextMenu className="pv2 ph1" style={{ zIndex: 1001 }} visible={isContextVisible}
        target={buttonRef} onDismiss={() => setContextVisibility(false)} arrowAlign="right">
        { showAutoUpload && (
          <ContextMenuItem className='pv2 ph1' onClick={ () => onToggleModalOpen(name) }>
            <StrokeCloud width="28" className='fill-aqua'/> <span className="ph1">{autoUpload ? t('pinningServices.removeAutoUpload') : t('pinningServices.addAutoUpload')}</span>
          </ContextMenuItem>)
        }
        { visitServiceUrl && (
          <a className='link flex items-center' href={visitServiceUrl} target='_blank' rel='noopener noreferrer'>
            <ContextMenuItem className='pv2 ph1' onClick={ () => setContextVisibility(false) }>
              <StrokeExternalLink width="28" className='fill-aqua'/> <span className="ph1 charcoal">{t('visitService')}</span>
            </ContextMenuItem>
          </a>)
        }
        <ContextMenuItem className='pv2 ph1' onClick={ handleRemove }>
          <StrokeCancel width="28" className='fill-aqua'/> <span className="ph1">{t('remove')}</span>
        </ContextMenuItem>
      </ContextMenu>
    </div>

  )
}

export default connect(
  'selectIpfsReady',
  'selectLocalPinsSize',
  'selectLocalNumberOfPins',
  'selectPinningServices',
  'selectArePinningServicesSupported',
  'doFetchPinningServices',
  'doFetchPinningServicesStats',
  'doFetchLocalPinsStats',
  'doRemovePinningService',
  PinningManager
)

import React, { Fragment, useEffect, useState, useMemo, useRef } from 'react'
import { connect } from 'redux-bundler-react'
// import filesize from 'filesize'
import { AutoSizer, Table, Column, SortDirection } from 'react-virtualized'
import { sortByProperty } from '../../lib/sort'

// Components
import Button from '../button/Button'
import Overlay from '../overlay/Overlay'
import PinningModal from './pinning-manager-modal/PinningManagerModal'
import GlyphPin from '../../icons/GlyphPin'
import ContextMenu from '../context-menu/ContextMenu'
import ContextMenuItem from '../context-menu/ContextMenuItem'
import GlyphDots from '../../icons/GlyphDots'
import StrokeCancel from '../../icons/StrokeCancel'
import StrokeExternalLink from '../../icons/StrokeExternalLink'

import './PinningManager.css'

const ROW_HEIGHT = 50
const HEADER_HEIGHT = 32

export const PinningManager = ({ pinningServices, arePinningServicesAvailable, doFetchPinningServices, doPinsSizeGet, doRemovePinningService, pinsSize, numberOfPins, t }) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const onModalOpen = () => setModalOpen(true)
  const onModalClose = () => setModalOpen(false)

  const [sortSettings, setSortSettings] = useState({
    sortBy: 'addedAt',
    sortDirection: SortDirection.ASC
  })
  useEffect(() => {
    (async () => {
      try {
        await doPinsSizeGet()
      } catch (e) {
        console.error('doPinsSizeGet error', e)
      }
    })()
  }, [doPinsSizeGet])

  useEffect(() => {
    doFetchPinningServices()
  }, [doFetchPinningServices])

  const localPinning = useMemo(() =>
    ({ name: t('localPinning'), type: 'LOCAL', totalSize: pinsSize, numberOfPins }),
  [numberOfPins, pinsSize, t])

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
                <Column label={t('autoUpload')} title={t('autoUpload')} dataKey='autoUpload' width={width * 0.2} flexShrink={1} cellRenderer={({ rowData }) => <AutoUploadCell autoUpload={rowData.autoUpload} type={rowData.type} name={rowData.name} doRemovePinningService={doRemovePinningService} t={t} />} className='pinningManagerColumn charcoal truncate f6 pl2' />
              </Table>
            )}
          </AutoSizer>
        </div>
        { arePinningServicesAvailable &&
        (<div className='flex justify-end w-100 mt2'>
          <Button className="tc mt2" bg='bg-navy' onClick={onModalOpen}>
            <span><span className="aqua">+</span> {t('actions.addService')}</span>
          </Button>
        </div>
        )}
      </div>

      <Overlay show={isModalOpen} onLeave={onModalClose}>
        <PinningModal className='outline-0' onLeave={() => {
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
    <span className="truncate">{ rowData.name }</span>
  </div>
)

// const SizeCell = ({ rowData, t }) => (
//   <p className={ !rowData.totalSize ? 'gray nowrap' : 'nowrap'}>{ !rowData.totalSize
//     ? `${(t('app:terms:loading'))}...`
//     : filesize(rowData.totalSize || 0, {
//       round: rowData.totalSize >= 1000000000 ? 1 : 0, spacer: ''
//     })}</p>
// )
const NumberOfPinsCell = ({ rowData, t }) => {
  const { numberOfPins } = rowData
  if (numberOfPins === 'Error') {
    return <div className='red'>{t('errors.failedToFetch')}</div>
  }
  return <div className={rowData.numberOfPins >= 0 ? '' : 'gray'}>{rowData.numberOfPins >= 0 ? rowData.numberOfPins : `${(t('app:terms:loading'))}...`}</div>
}
const AutoUploadCell = ({ autoUpload, name, doRemovePinningService, t, type }) => (
  <div className="flex justify-between items-center">
    <div className={!autoUpload ? 'gray' : ''}>{ autoUpload ? t('autoUploadKeys.' + autoUpload) : 'N/A' }</div>
    { type !== 'LOCAL' && <OptionsCell doRemovePinningService={doRemovePinningService} name={name} t={t}/> }
  </div>
)

const OptionsCell = ({ doRemovePinningService, name, t }) => {
  const buttonRef = useRef()
  const [isContextVisible, setContextVisibility] = useState(false)

  const handleRemove = () => {
    doRemovePinningService(name)
    setContextVisibility(false)
  }

  const visitServicesList = {
    pinata: 'https://webtest.pinata.cloud/documentation'
  }
  const visitServiceUrl = visitServicesList[name.toLowerCase()]

  return (
    <div>
      <button className="button-inside-focus" onClick={() => setContextVisibility(true)} ref={buttonRef} aria-label={t('showOptions')}>
        <GlyphDots width={24} className='fill-gray-muted hover-fill-gray transition-all'/>
      </button>
      <ContextMenu className="pv2 ph1" style={{ zIndex: 1001 }} visible={isContextVisible}
        target={buttonRef} onDismiss={() => setContextVisibility(false)} arrowAlign="right">
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
  'doPinsSizeGet',
  'selectPinsSize',
  'selectNumberOfPins',
  'selectPinningServices',
  'selectArePinningServicesAvailable',
  'doFetchPinningServices',
  'doRemovePinningService',
  PinningManager
)

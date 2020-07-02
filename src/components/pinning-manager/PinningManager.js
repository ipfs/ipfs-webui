import React, { Fragment, useEffect, useState, useMemo, useRef } from 'react'
import { connect } from 'redux-bundler-react'
import filesize from 'filesize'
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
import StrokeSettings from '../../icons/StrokeSettings'
import StrokeCancel from '../../icons/StrokeCancel'
import StrokeExternalLink from '../../icons/StrokeExternalLink'

import './PinningManager.css'

const ROW_HEIGHT = 50
const HEADER_HEIGHT = 32

export const PinningManager = ({ pinningServices, doFilesSizeGet, doFilesFetch, filesSize, t }) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const onModalOpen = () => setModalOpen(true)
  const onModalClose = () => setModalOpen(false)

  const [sortSettings, setSortSettings] = useState({
    sortBy: 'addedAt',
    sortDirection: SortDirection.ASC
  })
  useEffect(() => {
    (async () => {
      await doFilesFetch()
      await doFilesSizeGet()
    })()
  }, [doFilesFetch, doFilesSizeGet])

  const localPinning = useMemo(() =>
    ({ name: t('localPinning'), svgIcon: GlyphPin, totalSize: filesSize }),
  [filesSize, t])

  const sortedServices = useMemo(() =>
    (pinningServices || []).sort(sortByProperty(sortSettings.sortBy, sortSettings.sortDirection === SortDirection.ASC ? 1 : -1)),
  [pinningServices, sortSettings.sortBy, sortSettings.sortDirection])

  const sortedList = useMemo(() => [localPinning, ...sortedServices], [localPinning, sortedServices])

  return (
    <Fragment>
      <div className="mv4 pinningManager">
        <div className='ph4 flex items-center bg-white lh-copy charcoal f6 fw5'>
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
                <Column label={t('service')} dataKey='name' width={250} cellRenderer={ServiceCell} className='charcoal truncate f6 pl2' />
                <Column label={t('files')} dataKey='totalSize' width={250} cellRenderer={SizeCell} className='charcoal truncate f6 pl2' />
                <Column label={t('bandwidthUsed')} dataKey='bandwidth' width={250} cellRenderer={BandwidthCell} className='charcoal truncate f6 pl2' />
                <Column label={t('autoUpload')} dataKey='autoUpload' width={250} cellRenderer={({ rowData }) => <AutoUploadCell autoUpload={rowData.autoUpload} t={t} />} className='pinningManagerColumn charcoal truncate f6 pl2' />
              </Table>
            )}
          </AutoSizer>
        </div>
        <div className='flex justify-end w-100 mt2'>
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

PinningManager.defaultProps = {
  pinningServices: []
}

const ServiceCell = ({ rowData }) => {
  const iconClass = 'mr2 pr1 fill-teal'
  return (
    <div className='flex items-center'>
      { rowData.svgIcon && (<rowData.svgIcon width="28" height="28" className={iconClass} />)}
      { rowData.icon && (<img src={rowData.icon} alt={rowData.name} width="28" height="28" className={iconClass} style={{ objectFit: 'contain' }} />)}
      { rowData.name }
    </div>
  )
}

const SizeCell = ({ rowData }) => (
  <p className={ !rowData.totalSize && 'gray'}>{ !rowData.totalSize ? 'N/A' : filesize(rowData.totalSize || 0, {
    round: rowData.totalSize >= 1000000000 ? 1 : 0, spacer: ''
  })}</p>
)
const BandwidthCell = ({ rowData }) => (<div className={!rowData.bandwidthUsed && 'gray'}>{rowData.bandwidthUsed || 'N/A'}</div>)
const AutoUploadCell = ({ autoUpload, t }) => (
  <div className="flex justify-between items-center">
    <div className={!autoUpload && 'gray'}>{ autoUpload ? t('autoUploadKeys.' + autoUpload) : 'N/A' }</div>
    <OptionsCell t={t}/>
  </div>
)

const OptionsCell = ({ t }) => {
  const buttonRef = useRef()
  const [isContextVisible, setContextVisibility] = useState(false)

  return (
    <div>
      <button className="button-inside-focus" onClick={() => setContextVisibility(true)} ref={buttonRef} aria-label={t('showOptions')}>
        <GlyphDots width={24} className='fill-gray-muted hover-fill-gray transition-all'/>
      </button>
      <ContextMenu className="pv2 ph1" style={{ zIndex: 1001 }} visible={isContextVisible}
        target={buttonRef} onDismiss={() => setContextVisibility(false)} arrowAlign="right">
        <ContextMenuItem className='pv2 ph1' onClick={ /* TODO: add this feature */ () => setContextVisibility(false) }>
          <StrokeSettings width="28" className='fill-aqua'/> <span className="ph1">{t('edit')}</span>
        </ContextMenuItem>
        <ContextMenuItem className='pv2 ph1' onClick={ /* TODO: add this feature */ () => setContextVisibility(false) }>
          <StrokeExternalLink width="28" className='fill-aqua'/> <span className="ph1">{t('visitService')}</span>
        </ContextMenuItem>
        <ContextMenuItem className='pv2 ph1' onClick={ /* TODO: add this feature */ () => setContextVisibility(false) }>
          <StrokeCancel width="28" className='fill-aqua'/> <span className="ph1">{t('remove')}</span>
        </ContextMenuItem>
      </ContextMenu>
    </div>

  )
}

export default connect(
  'doFilesFetch',
  'doFilesSizeGet',
  'selectFilesSize',
  'selectPinningServices',
  PinningManager
)

import React, { Fragment, useEffect, useState, useMemo } from 'react'
import { connect } from 'redux-bundler-react'
import filesize from 'filesize'
import { AutoSizer, Table, Column, SortDirection } from 'react-virtualized'
import { sortByProperty } from '../../lib/sort'

// Components
import Button from '../button/Button'
import Overlay from '../overlay/Overlay'
import PinningModal from './pinning-manager-modal/PinningManagerModal'
import GlyphPin from '../../icons/GlyphPin'

const TABLE_HEIGHT = 400
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
      <div>
        <div className='ph4 flex items-center bg-white lh-copy charcoal f6 fw5'>
          <AutoSizer disableHeight>
            {({ width }) => (
              <Table
                className='tl fw4 w-100 f6'
                headerClassName='teal fw2 ttu tracked ph2'
                width={width}
                height={TABLE_HEIGHT}
                headerHeight={HEADER_HEIGHT}
                rowHeight={ROW_HEIGHT}
                rowCount={pinningServices.length}
                rowGetter={({ index }) => sortedList[index]}
                sort={(...sortArgs) => setSortSettings(...sortArgs)}
                sortBy={sortSettings.sortBy}
                sortDirection={sortSettings.sortDirection}>
                <Column label={t('service')} dataKey='name' cellRenderer={serviceCell} width={250} className='charcoal truncate f6 pl2' />
                <Column label={t('files')} dataKey='totalSize' cellRenderer={sizeCell} width={250} className='charcoal truncate f6 pl2' />
                <Column label={t('bandwidthUsed')} dataKey='bandwidth' width={250} className='charcoal truncate f6 pl2' />
                <Column label={t('autoUpload')} dataKey='autoUpload' width={250} className='charcoal truncate f6 pl2' />
              </Table>
            )}
          </AutoSizer>
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

PinningManager.defaultProps = {
  pinningServices: []
}

const serviceCell = ({ rowData }) => (
  <div className='flex items-center'>
    { rowData.svgIcon && (<rowData.svgIcon width="32" height="32" className="mr1 fill-teal" />)}
    { rowData.icon && (<img src={rowData.icon} alt={rowData.name} width="32" height="32" className="mr1" style={{ objectFit: 'contain' }} />)}
    { rowData.name }
  </div>
)

const sizeCell = ({ rowData }) => (
  <p>{ !rowData.totalSize ? 'N/A' : filesize(rowData.totalSize || 0, {
    round: rowData.totalSize >= 1000000000 ? 1 : 0, spacer: ''
  })}</p>
)

export default connect(
  'doFilesFetch',
  'doFilesSizeGet',
  'selectFilesSize',
  'selectPinningServices',
  PinningManager
)

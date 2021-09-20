import React, { Fragment, useState, useRef, useMemo, useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { sortByProperty } from '../../lib/sort'
import { AutoSizer, Table, Column, SortDirection } from 'react-virtualized'

// Components
import Button from '../button/Button'
import Overlay from '../overlay/Overlay'
import GenerateKeyModal from './generate-key-modal/GenerateKeyModal'
import RenameKeyModal from './rename-key-modal/RenameKeyModal'

import ContextMenu from '../context-menu/ContextMenu'
import ContextMenuItem from '../context-menu/ContextMenuItem'
import GlyphDots from '../../icons/GlyphDots'
import StrokePencil from '../../icons/StrokePencil'

const ROW_HEIGHT = 50
const HEADER_HEIGHT = 32

const AutoOptionsCell = ({ t, name, showRenameKeyModal }) => (
  <div className='flex justify-end'>
    { name !== 'self' && <OptionsCell
      name={name} t={t} showRenameKeyModal={showRenameKeyModal} /> }
  </div>
)

const OptionsCell = ({ t, name, showRenameKeyModal }) => {
  const buttonRef = useRef()
  const [isContextVisible, setContextVisibility] = useState(false)

  const handleRename = () => {
    showRenameKeyModal(name)
    setContextVisibility(false)
  }

  return (
    <div>
      <button className="button-inside-focus" onClick={() => setContextVisibility(true)} ref={buttonRef} aria-label={t('showOptions')}>
        <GlyphDots width={24} className='fill-gray-muted hover-fill-gray transition-all'/>
      </button>
      <ContextMenu className="pv2 ph1" style={{ zIndex: 1001 }} visible={isContextVisible}
        target={buttonRef} onDismiss={() => setContextVisibility(false)} arrowAlign="right">
        <ContextMenuItem className='pv2 ph1' onClick={handleRename}>
          <StrokePencil width="28" className='fill-aqua'/> <span className="ph1">{t('app:actions.rename')}</span>
        </ContextMenuItem>
      </ContextMenu>
    </div>
  )
}

export const IpnsManager = ({ ipfsReady, doFetchIpnsKeys, doGenerateIpnsKey, doRenameIpnsKey, t, ipnsKeys }) => {
  const [isGenerateKeyModalOpen, setGenerateKeyModalOpen] = useState(false)
  const showGenerateKeyModal = () => setGenerateKeyModalOpen(true)
  const hideGenerateKeyModal = () => setGenerateKeyModalOpen(false)

  const [renameKeyModalName, setRenameKeyModalOpen] = useState('')
  const showRenameKeyModal = (name) => setRenameKeyModalOpen(name)
  const hideRenameKeyModal = () => setRenameKeyModalOpen('')
  const isRenameKeyModalOpen = () => renameKeyModalName !== ''

  useEffect(() => {
    ipfsReady && doFetchIpnsKeys()
  }, [ipfsReady, doFetchIpnsKeys])

  const [sortSettings, setSortSettings] = useState({
    sortBy: 'name',
    sortDirection: SortDirection.ASC
  })

  const sortedKeys = useMemo(() =>
    (ipnsKeys || []).sort(sortByProperty(sortSettings.sortBy, sortSettings.sortDirection === SortDirection.ASC ? 1 : -1)),
  [ipnsKeys, sortSettings.sortBy, sortSettings.sortDirection])

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
                height={(sortedKeys.length + 1) * ROW_HEIGHT}
                headerHeight={HEADER_HEIGHT}
                rowHeight={ROW_HEIGHT}
                rowCount={sortedKeys.length}
                rowGetter={({ index }) => sortedKeys[index]}
                rowClassName='bb b--light-gray mt2'
                sort={(...sortArgs) => setSortSettings(...sortArgs)}
                sortBy={sortSettings.sortBy}
                sortDirection={sortSettings.sortDirection}>
                <Column label={t('app:terms.name')} title={t('app:terms.name')} dataKey='name' width={width * 0.3} flexShrink={0} flexGrow={1} cellRenderer={({ rowData }) => rowData.name} className='charcoal truncate f6' />
                <Column label={t('app:terms.id')} title={t('app:terms.id')} dataKey='id' width={width * 0.6} flexShrink={1} cellRenderer={({ rowData }) => rowData.id} className='charcoal monospace truncate f6 pl2' />
                <Column
                  dataKey='options'
                  width={width * 0.1}
                  flexShrink={1}
                  cellRenderer={({ rowData }) => <AutoOptionsCell t={t} name={rowData.name} showRenameKeyModal={showRenameKeyModal} />}
                  className='pinningManagerColumn charcoal truncate f6 pl2' />
              </Table>
            )}
          </AutoSizer>
        </div>

        <div className='flex justify-end w-100 mt2'>
          <Button className="tc mt2" bg='bg-navy' onClick={showGenerateKeyModal}>
            <span><span className="aqua">+</span> {t('actions.generateKey')}</span>
          </Button>
        </div>
      </div>

      <Overlay show={isGenerateKeyModalOpen} onLeave={hideGenerateKeyModal}>
        <GenerateKeyModal
          className='outline-0'
          onSubmit={(name) => {
            doGenerateIpnsKey(name)
            hideGenerateKeyModal()
          }}
          onCancel={hideGenerateKeyModal}
          t={t} />
      </Overlay>

      <Overlay show={isRenameKeyModalOpen()} onLeave={hideRenameKeyModal}>
        <RenameKeyModal
          className='outline-0'
          name={renameKeyModalName}
          onSubmit={(name) => {
            doRenameIpnsKey(renameKeyModalName, name)
            hideRenameKeyModal()
          }}
          onCancel={hideRenameKeyModal}
          t={t} />
      </Overlay>
    </Fragment>
  )
}

IpnsManager.defaultProps = {
  ipnsKeys: []
}

export default connect(
  'selectIpfsReady',
  'selectIpnsKeys',
  'doFetchIpnsKeys',
  'doGenerateIpnsKey',
  'doRemoveIpnsKey',
  'doRenameIpnsKey',
  IpnsManager
)

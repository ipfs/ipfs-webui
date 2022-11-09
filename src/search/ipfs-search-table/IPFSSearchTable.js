import React, { useState } from 'react'
// import PropTypes from 'prop-types'
// import classNames from 'classnames'
// import ms from 'milliseconds'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { Table, Column, AutoSizer, SortDirection } from 'react-virtualized'
// import Cid from '../../components/cid/Cid'
import { sortByProperty } from '../../lib/sort'
// import { getResourceURL } from '../../helpers/ApiSearchHelper'
// import IPFSSearchLogoText from '../../icons/IPFSSearchLogoText'
import FileIcon from '../../files/file-icon/FileIcon'
import StrokeIpld from '../../icons/StrokeIpld'
import './IPFSSearchTable.css'

const IPFSSearchTable = ({ t, searchResults }) => {
  const [sortBy, setSortBy] = useState('')
  const [sortDirection, setSortDirection] = useState(SortDirection.ASC)
  const sortedList = (searchResults || []).sort(sortByProperty(sortBy, sortDirection === SortDirection.ASC ? 1 : -1))
  const tableHeight = 400

  const sort = ({ sortBy, sortDirection }) => {
    setSortBy(sortBy)
    setSortDirection(sortDirection)
  }

  //   const typesLookup = {
  //   audio: 'audio',
  //   image: 'images',
  //   video: 'video',
  //   text: 'text',
  //   directory: 'directories',
  //   other: 'other',
  //   application: 'other'
  // }

  // const getFileType = (type, mimetype) => {
  //   if (type === 'directory') {
  //     return 'directory'
  //   }
  //   if (type === 'unknown' || !mimetype) {
  //     return 'other'
  //   }
  //   return typesLookup[mimetype.split('/')[0]]
  // }

  const thumbnailCellRenderer = ({ rowData }) => {
    // const ref = React.createRef()
    const { title, hash, type } = rowData
    // const fileType = getFileType(type, mimetype)
    const ipfsSearchDetailBaseUrl = 'https://ipfs-search.com/#/search'
    const detailLink = `${ipfsSearchDetailBaseUrl}?q=${hash}&page=1`
    return (
      <a href={detailLink} target="_blank" rel="noopener noreferrer" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <FileIcon name={title} type={type} />
      </a>
    )
  }

  // const detailViewCellRender = ({ rowData }) => {
  //   const { mimetype, hash } = rowData
  //   const type = mimetype ? typesLookup[mimetype.split('/')[0]] : 'other'
  //   const ipfsSearchDetailBaseUrl = 'https://ipfs-search.com/#/search/detail'
  //   const detailLink = `${ipfsSearchDetailBaseUrl}/${type}/${hash}?page=1`
  //   return (
  //     <a href={detailLink} target="_blank" rel="noopener noreferrer" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  //       <IPFSSearchLogoText />
  //     </a>
  //   )
  // }

  const exploreViewCellRender = ({ rowData }) => {
    const { hash } = rowData
    const exploreDetailUrl = `/#/explore/${hash}`

    return (
      <a href={exploreDetailUrl} rel="noopener noreferrer" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <StrokeIpld />
      </a>
    )
  }

  const dateViewCellRender = ({ rowData }) => {
    const lastSeen = rowData['last-seen']
    const lastSeenDate = new Date(lastSeen)
    const formattedDate = lastSeen ? `${lastSeenDate.toLocaleDateString()} ${lastSeenDate.toLocaleTimeString()} ` : 'N/A'
    return (
      <span>{formattedDate}</span>
    )
  }

  return (
    <div className={'bg-white-70 center'} style={{ height: `${tableHeight}px`, maxWidth: '1764' }}>
      { searchResults && <AutoSizer disableHeight>
        {({ width }) => (
          <Table
            className='tl fw4 w-100 f6'
            headerClassName='teal fw2 ttu tracked ph2 no-select'
            width={width}
            height={tableHeight}
            headerHeight={32}
            rowHeight={52}
            rowCount={searchResults.length}
            rowGetter={({ index }) => sortedList[index]}
            sort={sort}
            sortBy={sortBy}
            sortDirection={sortDirection}>
            <Column label={null} disableSort={true} cellRenderer={thumbnailCellRenderer} width={100} className='f6 charcoal pl2' />
            <Column label={null} disableSort={true} cellRenderer={exploreViewCellRender} width={100} className='f6 charcoal pl2' />
            { /* <Column label={null} disableSort={true} cellRenderer={detailViewCellRender} dataKey='' width={200} className='f6 charcoal pl2' /> */ }
            <Column label={t('search:tableColumnHeaders:title')} dataKey='title' width={450} className='f6 charcoal truncate pl2' />
            <Column label={t('search:tableColumnHeaders:hash')} dataKey='hash' width={200} className='f6 charcoal truncate pl2' />
            <Column label={t('search:tableColumnHeaders:fileSize')} dataKey='size' width={250} className='charcoal truncate f6 pl2' />
            <Column label={t('search:tableColumnHeaders:type')} dataKey='mimetype' width={250} className='f6 charcoal truncate pl2' />
            <Column label={t('search:tableColumnHeaders:lastSeen')} cellRenderer={dateViewCellRender} dataKey='last-seen' width={520} className='charcoal truncate f6 pl2' />
          </Table>
        )}
      </AutoSizer> }
    </div>
  )
}

export default connect(
  'selectSearchResults',
  withTranslation('search')(IPFSSearchTable)
)

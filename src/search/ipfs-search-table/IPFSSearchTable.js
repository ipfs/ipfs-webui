import React, { useState } from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { Table, Column, AutoSizer, SortDirection } from 'react-virtualized'
import { sortByProperty } from '../../lib/sort'
// import { getResourceURL } from '../../helpers/ApiSearchHelper'
import IPFSSearchLogoHex from '../../icons/IPFSSearchLogoHex'
import FileIcon from '../../files/file-icon/FileIcon'
import StrokeIpld from '../../icons/StrokeIpld'
import typeFromExt from '../../files/type-from-ext'
// import GlyphLinkExternal from '../../icons/GlyphLinkExternal'
import './IPFSSearchTable.css'

const IPFSSearchTable = ({ t, searchResults }) => {
  const [sortBy, setSortBy] = useState('')
  const [sortDirection, setSortDirection] = useState(SortDirection.ASC)
  const sortedList = (searchResults || []).sort(sortByProperty(sortBy, sortDirection === SortDirection.ASC ? 1 : -1))
  const tableHeight = 500

  const sort = ({ sortBy, sortDirection }) => {
    setSortBy(sortBy)
    setSortDirection(sortDirection)
  }

  const typesQueryLookup = {
    audio: 'audio',
    image: 'images',
    video: 'video',
    text: 'text',
    html: 'text',
    pdf: 'text',
    directory: 'directories'
  }

  const getQueryFileType = (type, title, mimetype) => {
    if (type === 'directory') {
      return 'directories'
    }
    if (type === 'unknown') {
      return 'other'
    }

    let strippedTitle = new DOMParser().parseFromString(title, 'text/html')
    strippedTitle = strippedTitle.body.textContent || ''

    const fileTypeFromExt = typeFromExt(strippedTitle)
    const queryTypeString = typesQueryLookup[mimetype?.split('/')[0]] || typesQueryLookup[fileTypeFromExt] || 'other'
    return queryTypeString
  }

  const thumbnailCellRenderer = ({ rowData }) => {
    const { title, hash, type, mimetype } = rowData
    const queryFileType = getQueryFileType(type, title, mimetype)
    const ipfsSearchDetailBaseUrl = 'https://ipfs-search.com/#/search/detail'
    const detailLink = `${ipfsSearchDetailBaseUrl}/${queryFileType}/${hash}?q=${hash}&page=1`
    return (
      <a href={detailLink} target='_blank' rel='noopener noreferrer' style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <FileIcon name={title} type={type} />
      </a>
    )
  }

  const detailViewHeader = () => {
    return (
        <IPFSSearchLogoHex />
    )
  }

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

  const titleCellRender = ({ rowData }) => {
    const title = rowData?.title || rowData?.metadata?.metadata?.title?.[0] || rowData?.metadata?.metadata?.resourceName?.[0] || rowData?.references?.[0]?.name || ''
    let strippedTitle = new DOMParser().parseFromString(title, 'text/html')
    strippedTitle = strippedTitle.body.textContent || ''

    return (
      <span>{strippedTitle}</span>
    )
  }

  const authorCellRender = ({ rowData }) => {
    const author = rowData?.author || rowData?.metadata?.metadata?.Author?.[0] || ''

    return (
      <span>{author}</span>
    )
  }

  const sizeCellRender = ({ rowData }) => {
    const { size } = rowData
    const fileSizeKB = size ? Number(size / 1000).toFixed(2) : null
    const fileSizeString = fileSizeKB ? `${fileSizeKB} kB` : ''

    return (
      <span>{fileSizeString}</span>
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
            <Column label={null} headerRenderer={detailViewHeader} disableSort={true} cellRenderer={thumbnailCellRenderer} dataKey='ipfs-search' width={85} className='f6 charcoal pl2' />
            <Column label={null} disableSort={true} cellRenderer={exploreViewCellRender} dataKey='explore' width={75} className='f6 charcoal pl2' />
            <Column label={t('search:tableColumnHeaders:title')} cellRenderer={titleCellRender} dataKey='title' width={450} className='f6 charcoal truncate pl2' />
            <Column label={t('search:tableColumnHeaders:author')} cellRenderer={authorCellRender} dataKey='author' width={250} className='f6 charcoal truncate pl2' />
            {/* <Column label={t('search:tableColumnHeaders:hash')} dataKey='hash' width={200} className='f6 charcoal truncate pl2' /> */}
            <Column label={t('search:tableColumnHeaders:fileSize')} dataKey='size' cellRenderer={sizeCellRender} width={150} className='charcoal truncate f6 pl2' />
            <Column label={t('search:tableColumnHeaders:type')} dataKey='mimetype' width={200} className='f6 charcoal truncate pl2' />
            <Column label={t('search:tableColumnHeaders:lastSeen')} cellRenderer={dateViewCellRender} dataKey='last-seen' width={250} className='charcoal truncate f6 pl2' />
            {/* <Column label={null} headerRenderer={detailViewHeader} disableSort={true} cellRenderer={detailViewCellRender} dataKey='ipfs-detail-search' width={100} className='f6 charcoal pl2' /> */}
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

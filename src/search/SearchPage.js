import React from 'react'
import { connect } from 'redux-bundler-react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import IPFSSearchTable from './ipfs-search-table/IPFSSearchTable'
import StartSearchingContainer from './StartSearchingContainer'

const SearchPage = ({ t, toursEnabled, handleJoyrideCallback, searchResults }) => {
  const renderSearchContent = () => {
    if (searchResults) {
      return <IPFSSearchTable />
    }

    return <StartSearchingContainer />
  }

  return (
    <div data-id='SearchPage' className='overflow-hidden'>
    <Helmet>
      <title>{t('title')} | IPFS Search</title>
    </Helmet>

    <div>
      {
        renderSearchContent()
      }
    </div>

  </div>
  )
}

export default connect(
  'selectSearchResults',
  withTranslation('search')(SearchPage)
)

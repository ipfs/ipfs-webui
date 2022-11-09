import React from 'react'
import { connect } from 'redux-bundler-react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import IPFSSearchTable from './ipfs-search-table/IPFSSearchTable'

const SearchPage = ({ t, toursEnabled, handleJoyrideCallback, searchResults }) => {
  return (
    <div data-id='SearchPage' className='overflow-hidden'>
    <Helmet>
      <title>{t('title')} | IPFS Search</title>
    </Helmet>

    <div>
      {searchResults &&
        <IPFSSearchTable />
      }
    </div>

  </div>
  )
}

export default connect(
  // 'doFetchSearchResults',
  'selectSearchResults',
  withTranslation('search')(SearchPage)
)

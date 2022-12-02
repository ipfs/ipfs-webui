import React from 'react'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import StrokeSearch from '../../icons/StrokeSearch'
import Button from '../../components/button/Button'
import IPFSSearchLogoText from '../../icons/IPFSSearchLogoText'
import './IPFSSearchForm.css'

const ipfsSearchUrl = 'https://ipfs-search.com'

const IPFSSearchForm = ({ t, ipfsSearch, searchInput, doUpdateSearchInput }) => {
  // const [searchInput, setSearchInput] = useState('')

  const onKeyDown = (evt) => {
    if (evt.key === 'Enter') {
      onSearch(evt)
    }
  }

  const onSearch = (evt) => {
    evt.preventDefault()

    ipfsSearch(searchInput)
  }

  const onChange = (evt) => {
    const updatedSearchInput = evt.target.value
    doUpdateSearchInput(updatedSearchInput)
    // setSearchInput(updatedPath)
  }

  const isValid = () => {
    return searchInput !== ''
  }

  const inputClass = () => {
    if (searchInput === '') {
      return 'focus-outline'
    }

    if (isValid) {
      return 'b--green-muted focus-outline-green'
    } else {
      return 'b--red-muted focus-outline-red'
    }
  }

  return (
    <div data-id='IPFSSearchForm' className='sans-serif black-80 flex w-100'>
      <div className='flex-auto'>
        <div className='relative'>
          <input id='ipfs-search' className={`input-reset bn pa2 mb1 db w-100 f6 br-0 placeholder-light ${inputClass}`} style={{ borderRadius: '3px 0 0 3px' }} type='text' placeholder='Search' aria-describedby='ipfs-search-desc' onChange={onChange} onKeyDown={onKeyDown} value={searchInput} />
          <div id='ipfs-search-desc' className='w-100 absolute f6 black-60 mb2 ipfs-search-power-desc' >
            <span>Powered by</span>
            <a href={`${ipfsSearchUrl}/#/search?q=${searchInput}&page=1`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span className='ipfs-search-logo'><IPFSSearchLogoText /></span>
            </a>
          </div>
        </div>
      </div>
      <div className='flex flex-row-reverse mb2'>
        <Button
          minWidth={0}
          disabled={!isValid}
          style={{ borderRadius: '0' }}
          title={t('app:actions.search')}
          onClick={onSearch}
          className='IPFSSearchFormButton button-reset pv1 ph2 ba f7 fw4 white bg-gray overflow-hidden tc' >
          <StrokeSearch style={{ height: '2em' }} className='dib fill-current-color v-mid' />
          <span className='ml2'>{t('app:actions.search')}</span>
        </Button>
      </div>
    </div>
  )
}

IPFSSearchForm.propTypes = {
  t: PropTypes.func.isRequired,
  ipfsSearch: PropTypes.func.isRequired
}

export default connect(
  'doUpdateSearchInput',
  'selectSearchInput',
  withTranslation('search')(IPFSSearchForm)
)

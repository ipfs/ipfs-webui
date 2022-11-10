// import { createAsyncResourceBundle } from 'redux-bundler'
import { ipfsApiSearch } from '../helpers/ApiSearchHelper'

const bundle = {
  name: 'search',
  getReducer: () => {
    const initialState = {
      loading: false,
      lastError: null,
      lastFetch: null,
      searchInput: '',
      searchResults: null
    }
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case 'FETCH_SEARCH_START':
          return Object.assign({}, state, {
            loading: true
          })
        case 'FETCH_SEARCH_ERROR':
          return Object.assign({}, state, {
            lastError: Date.now(),
            loading: false
          })
        case 'FETCH_SEARCH_SUCCESS':
          return Object.assign({}, state, {
            lastFetch: Date.now(),
            loading: false,
            lastError: null,
            searchResults: payload
          })
        case 'UPDATE_SEARCH_INPUT':
          return Object.assign({}, state, {
            searchInput: payload
          })
        default:
          return state
      }
    }
  },
  doFetchSearchResults: (searchInput, batch = 0) => ({ dispatch }) => {
    dispatch({ type: 'FETCH_SEARCH_START' })
    // const { searchInput, searchType, batchSize } = searchParams
    ipfsApiSearch(searchInput, null, batch)
      .then(async payload => {
        dispatch({ type: 'FETCH_SEARCH_SUCCESS', payload })
      })
      .catch(error => {
        dispatch({ type: 'FETCH_SEARCH_ERROR', error })
      })
  },
  doUpdateSearchInput: (searchInput) => ({ dispatch }) => {
    dispatch({ type: 'UPDATE_SEARCH_INPUT', payload: searchInput })
  },
  selectSearchInput: state => state.search.searchInput,
  selectSearchResultsRaw: state => state.search.searchResults,
  // selector for just the actual data if we have it
  selectSearchResults: state => state.search.searchResults?.hits
}

export default bundle

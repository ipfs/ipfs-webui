// import { createAsyncResourceBundle } from 'redux-bundler'
import { ipfsApiSearch } from '../helpers/ApiSearchHelper'

const bundle = {
  name: 'search',
  getReducer: () => {
    const initialState = {
      loading: false,
      lastError: null,
      lastFetch: null,
      // queryString: null,
      // searchType: null,
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
        default:
          return state
      }
    }
  },
  doFetchSearchResults: (searchInput) => ({ dispatch }) => {
    dispatch({ type: 'FETCH_SEARCH_START' })
    // const { searchInput, searchType, batchSize } = searchParams
    ipfsApiSearch(searchInput)
      .then(payload => {
        dispatch({ type: 'FETCH_SEARCH_SUCCESS', payload })
      })
      .catch(error => {
        dispatch({ type: 'FETCH_SEARCH_ERROR', error })
      })
  },
  selectSearchResultsRaw: state => state.search.searchResults,
  // selector for just the actual data if we have it
  selectSearchResults: state => state.search.searchResults?.hits
}

// bundle.reactSearchFetch = createSelector(
//   'selectSearchShouldUpdate',
//   'selectRouteInfo',
//   (shouldUpdate, routeInfo) => {
//     if (shouldUpdate && routeInfo.url === '/search') {
//       return { actionCreator: 'doFetchSearch' }
//     }
//   }
// )

export default bundle

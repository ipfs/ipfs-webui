export default {
  name: 'navbar',

  persistActions: ['NAVBAR_TOGGLE'],

  reducer: (state = { isOpen: true }, action) => {
    if (action.type === 'NAVBAR_TOGGLE') {
      return {
        isOpen: !state.isOpen
      }
    }

    return state
  },

  doToggleNavbar: () => async ({ dispatch }) => {
    dispatch({ type: 'NAVBAR_TOGGLE' })
  },

  selectNavbarIsOpen: state => state.navbar.isOpen,

  selectNavbarWidth: state => state.navbar.isOpen ? 250 : 100
}

export default {
  name: 'pinning',
  reducer: (state = {}) => state,

  // selectPinningServices: state => state.pinning
  // TODO: unmock this
  selectPinningServices: () => ([
    {
      name: 'Pinata',
      icon: 'https://svgshare.com/i/M7y.svg',
      addedAt: new Date()
    }, {
      name: 'Infura',
      icon: 'https://i.pinimg.com/originals/e2/8e/98/e28e98282e6ace744098d2d25ddee7d2.png',
      addedAt: new Date()
    }
  ])
}

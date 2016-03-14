import shallowEqual from './shallow-eql'

export default function shouldPureComponentUpdate (nextProps, nextState) {
  return !shallowEqual(this.props, nextProps) ||
         !shallowEqual(this.state, nextState)
}

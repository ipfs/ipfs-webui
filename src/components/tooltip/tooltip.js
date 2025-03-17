import React from 'react'
import PropTypes from 'prop-types'

export default class Tool extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    text: PropTypes.string.isRequired
  }

  state = {
    show: false,
    overflow: true
  }

  onResize = () => {
    if (this.state.overflow !== (this.el.offsetWidth < this.el.scrollWidth)) {
      this.setState((s) => ({ overflow: !s.overflow }))
    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize)
    this.onResize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
  }

  onMouseOver = () => {
    this.setState({ show: true })
  }

  onMouseLeave = () => {
    this.setState({ show: false })
  }

  render () {
    const { children, text, ...props } = this.props
    const { show, overflow } = this.state

    return (
      <div className='relative' {...props}>
        <div onMouseOver={this.onMouseOver} onMouseLeave={this.onMouseLeave} onFocus={this.onMouseOver} onBlur={this.onMouseLeave} className='overflow-hidden'>
          {React.Children.map(children, c => React.cloneElement(c, { ref: (n) => { this.el = n } }))}
        </div>

        <div style={{
          bottom: '-10px',
          left: '50%',
          transform: 'translate(-50%, 100%)',
          wordWrap: 'break-word',
          width: '100%'
        }} className={`white z-max bg-navy-muted br2 pa1 f6 absolute ${(show && overflow) ? 'db' : 'dn'}`}>
          <span style={{
            width: '17px',
            height: '17px',
            transform: 'translate(-50%, -50%) rotate(45deg)',
            borderRadius: '2px 0px 0px',
            left: '50%',
            zIndex: -1
          }} className='db bg-navy-muted absolute' />
          {text}
        </div>
      </div>
    )
  }
}

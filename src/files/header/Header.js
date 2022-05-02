import React from 'react'
import Breadcrumbs from '../breadcrumbs/Breadcrumbs'

class Header extends React.Component {
  handleBreadCrumbsContextMenu = (ev, breadcrumbsRef, file) => {
    const pos = breadcrumbsRef.getBoundingClientRect()
    this.props.handleContextMenu(ev, 'TOP', file, pos)
  }

  render () {
    const {
      files,
      onNavigate
    } = this.props

    return (
      <div className='db flex justify-between items-center'>
        <div className='mb3 overflow-hidden spacegrotesk mr2'>
          <Breadcrumbs className="joyride-files-breadcrumbs" path={files ? files.path : '/404'}
            onClick={onNavigate} onContextMenuHandle={(...args) => this.handleBreadCrumbsContextMenu(...args)}
            onAddFiles={this.props.onAddFiles} onMove={this.props.onMove} />
        </div>
      </div>
    )
  }
}

export default Header

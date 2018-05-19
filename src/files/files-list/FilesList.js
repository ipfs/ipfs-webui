import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../../components/checkbox/Checkbox'
import GlyphSmallCancel from '../../icons/GlyphSmallCancel'
import File from '../file/File'
import './FilesList.css'

class FileList extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    onShare: PropTypes.func.isRequired,
    onIPLD: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired
  }

  static defaultProps = {
    className: ''
  }

  state = {
    selected: []
  }

  selectAll = (checked) => {
    let selected = []

    if (checked) {
      selected = this.props.files.map(file => file.hash)
    }

    this.setState({ selected: selected })
  }

  selectOne = (hash, select) => {
    let selected = this.state.selected

    if (select) {
      selected.push(hash)
    } else {
      selected.splice(this.state.selected.indexOf(hash), 1)
    }

    this.setState({selected: selected})
  }

  selectedMenu = () => {
    if (this.state.selected.length === 0) {
      return null
    }

    const unselectAll = () => this.selectAll(false)

    return (
      <div className='SelectedMenu bt fixed bottom-0 right-0 w-100'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center'>
              <div className='SelectedCount relative f3 fw6 w2 h2 dib br-100'>
                <span className='absolute'>{this.state.selected.length}</span>
              </div>
              <div>
                <p className='ma0'>File selected</p>
                <p className='ma0 f6'>Total size: </p>
              </div>
            </div>
          </div>
          <div>
            Action Buttons
          </div>
          <div>
            <span onClick={unselectAll} className='pointer flex items-center'>
              <span className='mr2'>Deselect all</span>
              <GlyphSmallCancel onClick={unselectAll} className='w1' fill='#F26148' viewBox='37 37 28 28' />
            </span>
          </div>
        </div>
      </div>
    )
  }

  render () {
    let {className} = this.props
    className = `FilesList sans-serif border-box w-100 ${className}`

    let files = this.props.files.map(file => {
      return (
        <File
          onSelect={this.selectOne}
          selected={this.state.selected.indexOf(file.hash) !== -1}
          key={file.hash}
          {...file}
        />
      )
    })

    return (
      <section className={className}>
        <header className='gray flex items-center'>
          <div className='pa2 w2'>
            <Checkbox checked={this.state.selected.length === this.props.files.length} onChange={this.selectAll} />
          </div>
          <div className='pa2 f6 flex-grow-1 w-40'>File name</div>
          <div className='pa2 f6 w-30'>Status</div>
          <div className='pa2 f6 w-10'>Size</div>
          <div className='pa2 f6 w-10'>Peers</div>
        </header>
        {files}
        {this.selectedMenu()}
      </section>
    )
  }
}

export default FileList

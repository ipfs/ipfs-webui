import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../../components/checkbox/Checkbox'
import SelectedActions from '../selected-actions/SelectedActions'
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
      <SelectedActions
        unselectAll={unselectAll}
        count={this.state.selected.length}
        size={0}
      />
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

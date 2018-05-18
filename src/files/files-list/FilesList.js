import React from 'react'
import PropTypes from 'prop-types'
import prettyBytes from 'pretty-bytes'
import Checkbox from '../../components/checkbox/Checkbox'
import File from '../file/File'
import './FilesList.css'

class FileList extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    files: PropTypes.array.isRequired
  }

  static defaultProps = {
    className: ''
  }

  selectAll = (checked) => {
    if (checked) {
      console.log('Select all!')
    } else {
      console.log('Unselect all!')
    }
  }

  render () {
    let {className} = this.props
    className = `FilesList sans-serif border-box w-100 ${className}`

    let files = this.props.files.map(file => <File key={file.hash} {...file} />)

    return (
      <section className={className}>
        <header className='gray flex items-center'>
          <div className='pa2 w2'><Checkbox onChange={this.selectAll} /></div>
          <div className='pa2 f6 flex-grow-1 w-40'>File name</div>
          <div className='pa2 f6 w-30'>Status</div>
          <div className='pa2 f6 w-10'>Size</div>
          <div className='pa2 f6 w-10'>Peers</div>
        </header>
        {files}
      </section>
    )
  }
}

export default FileList

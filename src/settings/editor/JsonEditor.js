import React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/json'
import './theme/ipfs_dark'

class JsonEditor extends React.Component {
  render () {
    const {value, readOnly, onChange} = this.props
    return (
      <div className='pv3 bg-navy br2'>
        <AceEditor
          value={value}
          readOnly={readOnly}
          onChange={onChange}
          mode='json'
          theme='ipfs_dark'
          width='100%'
          height='2100px'
          fontSize={12}
          showPrintMargin={false}
          showGutter
          editorProps={{
            $blockScrolling: Infinity
          }}
          setOptions={{
            showLineNumbers: true,
            tabSize: 2
          }} />
      </div>
    )
  }
}

export default JsonEditor

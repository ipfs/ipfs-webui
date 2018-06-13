import React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/json'
import './theme/ipfs_dark'

class JsonEditor extends React.Component {
  render () {
    const {value} = this.props
    const valueStr = value ? JSON.stringify(value, null, 2) : ''
    return (
      <AceEditor
        mode='json'
        theme='ipfs_dark'
        width='100%'
        height='2100px'
        onLoad={this.onLoad}
        onChange={this.onChange}
        fontSize={12}
        showPrintMargin={false}
        showGutter
        highlightActiveLine={false}
        value={valueStr}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2
        }} />
    )
  }
}

export default JsonEditor

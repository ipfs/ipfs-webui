import React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/json'
import 'brace/theme/solarized_dark'

const JsonEditor = ({value}) => {
  const valueStr = value ? JSON.stringify(value, null, 2) : ''
  console.log({value, valueStr})
  return (
    <AceEditor
      mode='json'
      theme='solarized_dark'
      width='100%'
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

export default JsonEditor

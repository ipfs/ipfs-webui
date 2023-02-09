import React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/json.js'
import './theme/ipfs_dark.js'

export class JsonEditor extends React.Component {
  render () {
    const { value, readOnly, onChange } = this.props
    const lineHeight = 16
    const height = Math.max(500, value.split('\n').length * lineHeight)

    return (
      <div className='pv3 bg-navy br2'>
        <AceEditor
          value={value}
          readOnly={readOnly}
          onChange={onChange}
          mode='json'
          theme='ipfs_dark'
          width='100%'
          height={height + 'px'}
          fontSize={12}
          showPrintMargin={false}
          showGutter
          editorProps={{ $blockScrolling: Infinity }}
          setOptions={{ showLineNumbers: true, tabSize: 2 }} />
      </div>
    )
  }
}

export default JsonEditor

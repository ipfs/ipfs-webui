import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'
import Button from '../components/button/Button'
import JsonEditor from './editor/JsonEditor'

export class SettingsPage extends React.Component {
  render () {
    const {isSaving, hasErrors, hasLocalChanges, hasExternalChanges, config, onChange, onReset, onSave, editorKey} = this.props
    return (
      <div data-id='SettingsPage'>
        <Helmet>
          <title>Settings - IPFS</title>
        </Helmet>
        <Box>
          <div className='dt dt--fixed'>
            <div className='dtc v-mid' style={{height: 58}}>
              {hasExternalChanges ? (
                <p className='ma0 pb3 lh-copy red f5 mw7'>
                  The settings have changed, please click <strong>Reset</strong> to update the editor contents.
                </p>
              ) : (
                <p className='ma0 pb3 lh-copy charcoal-muted f6 mw7'>
                  The go-ipfs config file is a json document. It is read once at node instantiation, either for an offline command, or when starting the daemon. Commands that execute on a running daemon do not read the config file at runtime.
                </p>
              )}
            </div>
            <div className='dtc tr' style={{width: 300}}>
              <Button className='ml2' bg='bg-charcoal' disabled={!hasLocalChanges && !hasExternalChanges} onClick={onReset}>Reset</Button>
              <Button className='ml2' bg={hasErrors ? 'bg-red-muted' : 'bg-aqua'} disabled={!hasLocalChanges} onClick={onSave}>Save</Button>
            </div>
          </div>
          <JsonEditor value={config} onChange={onChange} readOnly={isSaving} key={editorKey} />
        </Box>
      </div>
    )
  }
}

export class SettingsPageContainer extends React.Component {
  state = {
    isSaving: false,
    // valid json?
    hasErrors: false,
    // we edited it
    hasLocalChanges: false,
    // something else edited it
    hasExternalChanges: false,
    // mutable copy of the config
    editableConfig: this.props.config,
    // reset the editor on reset
    editorKey: Date.now()
  }

  onChange = (value) => {
    console.log('onChange')
    this.setState({
      hasErrors: !this.isValidJson(value),
      hasLocalChanges: this.props.config !== value,
      editableConfig: value
    })
  }

  onReset = () => {
    this.setState({
      hasErrors: false,
      hasLocalChanges: false,
      hasExternalChanges: false,
      editableConfig: this.props.config,
      editorKey: Date.now()
    })
  }

  onSave = async () => {
    this.setState({isSaving: true})
    try {
      await this.props.doSaveConfig(this.state.editableConfig)
    } catch (err) {
      console.log(err)
    }
    this.setState({isSaving: false})
  }

  isValidJson (str) {
    try {
      JSON.parse(str)
      return true
    } catch (err) {
      return false
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.config !== this.props.config) {
      if (!prevProps.config) {
        // no previous config, so set it.
        this.setState({
          editableConfig: this.props.config
        })
      } else if (this.props.config !== this.state.editableConfig) {
        // uh oh... something edited the config while we were looking at it.
        this.setState({
          hasExternalChanges: true
        })
      }
    }
  }

  render () {
    const { isSaving, hasErrors, hasLocalChanges, hasExternalChanges, editableConfig, editorKey } = this.state
    return editableConfig ? (
      <SettingsPage
        isSaving={isSaving}
        hasErrors={hasErrors}
        hasLocalChanges={hasLocalChanges}
        hasExternalChanges={hasExternalChanges}
        config={editableConfig}
        editorKey={editorKey}
        onChange={this.onChange}
        onReset={this.onReset}
        onSave={this.onSave} />
    ) : null
  }
}

export default connect('selectConfig', 'selectConfigIsLoading', 'doSaveConfig', SettingsPageContainer)

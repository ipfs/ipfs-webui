import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'
import Button from '../components/button/Button'
import JsonEditor from './editor/JsonEditor'
import Tick from '../icons/GlyphSmallTick'

export class SettingsPage extends React.Component {
  render () {
    const {isLoading, isSaving, hasSaveFailed, hasSaveSucceded, hasErrors, hasLocalChanges, hasExternalChanges, config, onChange, onReset, onSave, editorKey} = this.props
    return (
      <div data-id='SettingsPage'>
        <Helmet>
          <title>Settings - IPFS</title>
        </Helmet>
        <Box>
          <div className='dt dt--fixed pb3'>
            <div className='dtc v-mid'>
              <SettingsInfo config={config} isLoading={isLoading} hasExternalChanges={hasExternalChanges} hasSaveFailed={hasSaveFailed} hasSaveSucceded={hasSaveSucceded} />
            </div>
            <div className='dtc tr v-btm pt2' style={{width: 240}}>
              { config ? (
                <div>
                  <Button className='ml3' bg='bg-charcoal' disabled={isSaving || !hasLocalChanges} onClick={onReset}>Reset</Button>
                  <SaveButton hasErrors={hasErrors} hasSaveFailed={hasSaveFailed} hasSaveSucceded={hasSaveSucceded} isSaving={isSaving} hasLocalChanges={hasLocalChanges} onClick={onSave} />
                </div>
              ) : null }
            </div>
          </div>
          {config ? (
            <JsonEditor value={config} onChange={onChange} readOnly={isSaving} key={editorKey} />
          ) : null}
        </Box>
      </div>
    )
  }
}

const SaveButton = ({hasErrors, hasSaveFailed, hasSaveSucceded, isSaving, hasLocalChanges, onClick}) => {
  let bg = 'bg-aqua'
  if (hasErrors || hasSaveFailed) {
    bg = 'bg-red-muted'
  }
  if (hasSaveSucceded) {
    bg = 'bg-green'
  }
  return (
    <Button className='ml2' bg={bg} disabled={!hasLocalChanges} onClick={onClick}>
      {hasSaveSucceded ? <Tick height={16} className='fill-snow' style={{transform: 'scale(3)'}} /> : isSaving ? 'Saving' : 'Save'}
    </Button>
  )
}

const SettingsInfo = ({hasExternalChanges, hasSaveFailed, hasSaveSucceded, isLoading, config}) => {
  if (!config) {
    return (
      <p className='ma0 lh-copy charcoal f5 mw7'>
        { isLoading ? 'Fetching settings...' : 'Settings not available. Please check your IPFS daemon is running.' }
      </p>
    )
  } else if (hasExternalChanges) {
    return (
      <p className='ma0 lh-copy red f5 mw7'>
        The settings have changed, please click <strong>Reset</strong> to update the editor contents
      </p>
    )
  } else if (hasSaveFailed) {
    return (
      <p className='ma0 lh-copy red fw6 f5 mw7'>
        An error occured while saving your changes
        <span className='db fw4 f6 charcoal-muted'>Check the browser console for more info.</span>
      </p>
    )
  } else if (hasSaveSucceded) {
    return (
      <p className='ma0 lh-copy green fw6 f5 mw7'>
        Your changes have been saved
        <span className='db fw4 f6 charcoal-muted'>The new settings will be used next time you restart the IPFS daemon.</span>
      </p>
    )
  }
  return (
    <p className='ma0 lh-copy charcoal-muted f6 mw7'>
      The go-ipfs config file is a json document. It is read once at node instantiation, either for an offline command, or when starting the daemon. Commands that execute on a running daemon do not read the config file at runtime.
    </p>
  )
}

export class SettingsPageContainer extends React.Component {
  state = {
    isSaving: false,
    hasSaveFailed: false,
    hasSaveSucceded: false,
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
    this.setState({
      hasSaveFailed: false,
      hasSaveSucceded: false,
      hasErrors: !this.isValidJson(value),
      hasLocalChanges: this.props.config !== value,
      editableConfig: value
    })
  }

  onReset = () => {
    this.setState({
      isSaving: false,
      hasSaveFailed: false,
      hasSaveSucceded: false,
      hasErrors: false,
      hasLocalChanges: false,
      hasExternalChanges: false,
      editableConfig: this.props.config,
      editorKey: Date.now()
    })
  }

  onSave = async () => {
    if (this.state.isSaving) return console.log('Save ignored, there is a save in progress.')
    this.setState({isSaving: true})
    try {
      await this.props.doSaveConfig(this.state.editableConfig)
    } catch (err) {
      console.log(err)
      return this.setState({isSaving: false, hasSaveFailed: err})
    }
    this.setState({hasSaveSucceded: true})
    setTimeout(() => {
      this.onReset()
    }, 1500)
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
    const { configIsLoading } = this.props
    const { isSaving, hasSaveFailed, hasSaveSucceded, hasErrors, hasLocalChanges, hasExternalChanges, editableConfig, editorKey } = this.state
    return (
      <SettingsPage
        isLoading={configIsLoading}
        isSaving={isSaving}
        hasSaveFailed={hasSaveFailed}
        hasSaveSucceded={hasSaveSucceded}
        hasErrors={hasErrors}
        hasLocalChanges={hasLocalChanges}
        hasExternalChanges={hasExternalChanges}
        config={editableConfig}
        editorKey={editorKey}
        onChange={this.onChange}
        onReset={this.onReset}
        onSave={this.onSave} />
    )
  }
}

export default connect('selectConfig', 'selectConfigIsLoading', 'doSaveConfig', SettingsPageContainer)

import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'
import Button from '../components/button/Button'
import JsonEditor from './editor/JsonEditor'
import Tick from '../icons/GlyphSmallTick'

const PAUSE_AFTER_SAVE_MS = 1500

export class SettingsPage extends React.Component {
  render () {
    const {isConfigBlocked, isLoading, isSaving, hasSaveFailed, hasSaveSucceded, hasErrors, hasLocalChanges, hasExternalChanges, config, onChange, onReset, onSave, editorKey} = this.props
    return (
      <div data-id='SettingsPage'>
        <Helmet>
          <title>Settings - IPFS</title>
        </Helmet>
        <Box>
          <div className='dt dt--fixed pb3'>
            <div className='dtc v-mid'>
              <SettingsInfo config={config} isConfigBlocked={isConfigBlocked} isLoading={isLoading} hasExternalChanges={hasExternalChanges} hasSaveFailed={hasSaveFailed} hasSaveSucceded={hasSaveSucceded} />
            </div>
            <div className='dtc tr v-btm pt2' style={{width: 240}}>
              { config ? (
                <div>
                  <Button className='ml3' bg='bg-charcoal' disabled={isSaving || (!hasLocalChanges && !hasExternalChanges)} onClick={onReset}>Reset</Button>
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
  } else if (hasSaveSucceded) {
    bg = 'bg-green'
  }
  return (
    <Button className='ml2' bg={bg} disabled={!hasLocalChanges || hasErrors} danger={hasErrors} onClick={onClick}>
      {hasSaveSucceded && !hasSaveFailed ? <Tick height={16} className='fill-snow' style={{transform: 'scale(3)'}} /> : isSaving ? 'Saving' : 'Save'}
    </Button>
  )
}

const SettingsInfo = ({isConfigBlocked, hasExternalChanges, hasSaveFailed, hasSaveSucceded, isLoading, config}) => {
  if (isConfigBlocked) {
    return (
      <p className='ma0 lh-copy charcoal f5 mw7'>
        The IPFS config API is not available. Please disable the IPFS Companion web-extension and try again.
      </p>
    )
  } else if (!config) {
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
      The IPFS config file is a json document. It is read once when the IPFS daemon is started.<br />
      Save your changes then restart the IPFS deamon to apply them.
    </p>
  )
}

export class SettingsPageContainer extends React.Component {
  state = {
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

  onSave = () => {
    this.props.doSaveConfig(this.state.editableConfig)
  }

  isValidJson (str) {
    try {
      JSON.parse(str)
      return true
    } catch (err) {
      return false
    }
  }

  isRecent (msSinceEpoch) {
    return msSinceEpoch > Date.now() - PAUSE_AFTER_SAVE_MS
  }

  componentDidUpdate (prevProps) {
    if (this.props.configSaveLastSuccess !== prevProps.configSaveLastSuccess) {
      setTimeout(() => this.onReset(), PAUSE_AFTER_SAVE_MS)
    }
    if (prevProps.config !== this.props.config) {
      // no previous config, or we just saved.
      if (!prevProps.config || this.isRecent(this.props.configSaveLastSuccess)) {
        return this.setState({
          editableConfig: this.props.config
        })
      }
      // uh oh... something else edited the config while we were looking at it.
      if (this.props.config !== this.state.editableConfig) {
        return this.setState({
          hasExternalChanges: true
        })
      }
    }
  }

  render () {
    const { isConfigBlocked, configIsLoading, configLastError, configIsSaving, configSaveLastSuccess, configSaveLastError } = this.props
    const { hasErrors, hasLocalChanges, hasExternalChanges, editableConfig, editorKey } = this.state
    const hasSaveSucceded = this.isRecent(configSaveLastSuccess)
    const hasSaveFailed = this.isRecent(configSaveLastError)
    const isLoading = configIsLoading || (!editableConfig && !configLastError)
    return (
      <SettingsPage
        isConfigBlocked={isConfigBlocked}
        isLoading={isLoading}
        isSaving={configIsSaving}
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

export default connect(
  'selectConfig',
  'selectIsConfigBlocked',
  'selectConfigLastError',
  'selectConfigIsLoading',
  'selectConfigIsSaving',
  'selectConfigSaveLastSuccess',
  'selectConfigSaveLastError',
  'doSaveConfig',
  SettingsPageContainer
)

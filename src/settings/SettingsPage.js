import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import ReactJoyride from 'react-joyride'
// Tour
import { settingsTour } from '../lib/tours.js'
import withTour from '../components/tour/withTour.js'
import { getJoyrideLocales } from '../helpers/i8n.js'
// Components
import Tick from '../icons/GlyphSmallTick.js'
import Box from '../components/box/Box.js'
import Button from '../components/button/Button.js'
import LanguageSelector from '../components/language-selector/LanguageSelector.js'
import PinningManager from '../components/pinning-manager/PinningManager.js'
import IpnsManager from '../components/ipns-manager/IpnsManager.js'
import AnalyticsToggle from '../components/analytics-toggle/AnalyticsToggle.js'
import ApiAddressForm from '../components/api-address-form/ApiAddressForm.js'
import PublicGatewayForm from '../components/public-gateway-form/PublicGatewayForm.js'
import { JsonEditor } from './editor/JsonEditor.js'
import Experiments from '../components/experiments/ExperimentsPanel.js'
import Title from './Title.js'
import CliTutorMode from '../components/cli-tutor-mode/CliTutorMode.js'
import Checkbox from '../components/checkbox/Checkbox.js'
import ComponentLoader from '../loader/ComponentLoader.js'
import StrokeCode from '../icons/StrokeCode.js'
import { cliCmdKeys, cliCommandList } from '../bundles/files/consts.js'

const PAUSE_AFTER_SAVE_MS = 3000

export const SettingsPage = ({
  t, tReady, isIpfsConnected, ipfsPendingFirstConnection, isIpfsDesktop,
  isLoading, isSaving, arePinningServicesSupported,
  hasSaveFailed, hasSaveSucceded, hasErrors, hasLocalChanges, hasExternalChanges,
  config, onChange, onReset, onSave, editorKey, analyticsEnabled, doToggleAnalytics,
  toursEnabled, handleJoyrideCallback, isCliTutorModeEnabled, doToggleCliTutorMode, command
}) => (
  <div data-id='SettingsPage' className='mw9 center'>
    <Helmet>
      <title>{t('title')} | IPFS</title>
    </Helmet>

    {/* Enable a full screen loader after updating to a new IPFS API address.
      * Will not show on consequent retries after a failure.
      */}
    { ipfsPendingFirstConnection
      ? <div className="absolute flex items-center justify-center w-100 h-100"
        style={{ background: 'rgba(255, 255, 255, 0.5)', zIndex: '10' }}>
        <ComponentLoader />
      </div>
      : null }

    { isIpfsDesktop
      ? null
      : <Box className='mb3 pa4-l pa2 joyride-settings-customapi'>
        <div className='lh-copy charcoal'>
          <Title>{t('app:terms.apiAddress')}</Title>
          <Trans i18nKey='apiDescription' t={t}>
            <p>If your node is configured with a <a className='link blue' href='https://github.com/ipfs/kubo/blob/master/docs/config.md#addresses' target='_blank' rel='noopener noreferrer'>custom API address</a>, including a port other than the default 5001, enter it here.</p>
          </Trans>
          <ApiAddressForm/>
        </div>
      </Box> }

    <Box className='mb3 pa4-l pa2'>
      <div className='lh-copy charcoal'>
        <Title>{t('app:terms.publicGateway')}</Title>
        <Trans i18nKey='publicGatewayDescription' t={t}>
          <p>Choose which <a className='link blue' href="http://docs.ipfs.io/concepts/ipfs-gateway/#public-gateways" target='_blank' rel='noopener noreferrer'>public gateway</a> you want to use to open your files.</p>
        </Trans>
        <PublicGatewayForm/>
      </div>
    </Box>

    <Box className='mb3 pa4-l pa2'>
      <Title>{t('ipnsPublishingKeys.title')}</Title>
      <p className='ma0 mr2 lh-copy charcoal f6'>
        {t('ipnsPublishingKeys.description')}&nbsp;<a className='link blue' target='_blank' rel='noopener noreferrer' href='https://docs.ipfs.io/concepts/glossary/#ipns'>{t('learnMoreLink')}</a>
      </p>
      <IpnsManager t={t} />
    </Box>

    <Box className='mb3 pa4-l pa2 joyride-settings-pinning'>
      <Title>{t('pinningServices.title')}</Title>
      <p className='ma0 mr2 lh-copy charcoal f6'>
        { arePinningServicesSupported
          ? t('pinningServices.description')
          : t('pinningServices.noPinRemoteDescription')
        }&nbsp;<a className='link blue' target='_blank' rel='noopener noreferrer' href='https://docs.ipfs.io/how-to/work-with-pinning-services/'>{t('learnMoreLink')}</a>
      </p>
      <PinningManager t={t} />
    </Box>

    <Box className='mb3 pa4-l pa2'>
      <div className='mb4 joyride-settings-language'>
        <Title>{t('language')}</Title>
        <LanguageSelector t={t} />
      </div>

      <div className='joyride-settings-analytics'>
        <Title>{t('analytics')}</Title>
        <AnalyticsToggle t={t} doToggleAnalytics={doToggleAnalytics} analyticsEnabled={analyticsEnabled} />
      </div>
    </Box>

    <Experiments t={t} />

    <Box className='mb3 pa4-l pa2 joyride-settings-tutormode'>
      <div className='charcoal'>
        <Title>{t('cliTutorMode')}</Title>
        <Checkbox className='dib' onChange={doToggleCliTutorMode} checked={isCliTutorModeEnabled}
          label={<span className='f5 lh-copy'>{t('cliToggle.label')}</span>}/>
        <Trans i18nKey='cliDescription' t={t}>
          <p className='f6 mv2'>Enable this option to display a "view code" <StrokeCode className='dib v-mid icon mh1 fill-charcoal' viewBox='14 20 70 66' style={{ height: 24 }} /> icon next to common IPFS commands. Clicking it opens a modal with that command's CLI code, so you can paste it into the IPFS command-line interface in your terminal.</p>
        </Trans>
      </div>
    </Box>

    { isIpfsConnected &&
    (<Box className='mb3 pa4-l pa2'>
      <div className='joyride-settings-config'>
        <Title>{t('config')}</Title>
        <div className='flex pb3'>
          <div className='flex-auto'>
            <div className='mw7'>
              <SettingsInfo
                t={t}
                tReady={tReady}
                config={config}
                isIpfsConnected={isIpfsConnected}
                isLoading={isLoading}
                hasExternalChanges={hasExternalChanges}
                hasSaveFailed={hasSaveFailed}
                hasSaveSucceded={hasSaveSucceded} />
            </div>
          </div>
          { config
            ? (
            <div className='flex flex-column justify-center flex-row-l items-center-l'>
              <CliTutorMode showIcon={true} config={config} t={t} command={command}/>
              <Button
                minWidth={100}
                height={40}
                bg='bg-charcoal'
                className='tc'
                disabled={isSaving || (!hasLocalChanges && !hasExternalChanges)}
                onClick={onReset}>
                {t('app:actions.reset')}
              </Button>
              <SaveButton
                t={t}
                tReady={tReady}
                hasErrors={hasErrors}
                hasSaveFailed={hasSaveFailed}
                hasSaveSucceded={hasSaveSucceded}
                hasLocalChanges={hasLocalChanges}
                hasExternalChanges={hasExternalChanges}
                isSaving={isSaving}
                onClick={onSave} />
            </div>
              )
            : null }
        </div>
      </div>
      { config
        ? (
        <JsonEditor
          value={config}
          onChange={onChange}
          readOnly={isSaving}
          key={editorKey} />
          )
        : null }
    </Box>
    )}

    <ReactJoyride
      run={toursEnabled}
      steps={settingsTour.getSteps({ t, Trans })}
      styles={settingsTour.styles}
      callback={handleJoyrideCallback}
      continuous
      scrollToFirstStep
      locale={getJoyrideLocales(t)}
      showProgress />
  </div>
)

const SaveButton = ({ t, hasErrors, hasSaveFailed, hasSaveSucceded, isSaving, hasLocalChanges, hasExternalChanges, onClick }) => {
  const bg = hasSaveSucceded ? 'bg-green' : 'bg-teal'
  return (
    <Button
      minWidth={100}
      height={40}
      className='mt2 mt0-l ml2-l tc'
      bg={bg}
      disabled={!hasLocalChanges || hasErrors}
      danger={hasSaveFailed || hasExternalChanges}
      onClick={onClick}>
      { hasSaveSucceded && !hasSaveFailed
        ? (
        <Tick height={16} className='fill-snow' style={{ transform: 'scale(3)' }} />
          )
        : (
            isSaving ? t('app:actions.saving') : t('app:actions.save')
          )}
    </Button>
  )
}

const SettingsInfo = ({ t, isIpfsConnected, hasExternalChanges, hasSaveFailed, hasSaveSucceded, isLoading, config }) => {
  if (!isIpfsConnected) {
    return (
      <p className='ma0 lh-copy charcoal f5 mw7'>
        {t('ipfsDaemonOffline')}
      </p>
    )
  } else if (!config) {
    return (
      <p className='ma0 lh-copy charcoal f5 mw7'>
        { isLoading ? t('fetchingSettings') : t('settingsUnavailable') }
      </p>
    )
  } else if (hasExternalChanges) {
    return (
      <p className='ma0 lh-copy red f5 mw7'>
        <Trans i18nKey='settingsHaveChanged' t={t}>
          The settings have changed, please click <strong>Reset</strong> to update the editor contents
        </Trans>
      </p>
    )
  } else if (hasSaveFailed) {
    return (
      <p className='ma0 lh-copy red fw6 f5 mw7'>
        {t('errorOccured')}
        <span className='db fw4 f6 charcoal-muted'>{t('checkConsole')}</span>
      </p>
    )
  } else if (hasSaveSucceded) {
    return (
      <p className='ma0 lh-copy green fw6 f5 mw7'>
        {t('changesSaved')}
        <span className='db fw4 f6 charcoal-muted'>{t('settingsWillBeUsedNextTime')}</span>
      </p>
    )
  }
  return (
    <p className='ma0 mr2 lh-copy charcoal f5'>
      {t('ipfsConfigDescription')} <a href='https://github.com/ipfs/kubo/blob/master/docs/config.md' rel='noopener noreferrer' target='_blank' className='link blue'>{t('ipfsConfigHelp')}</a>
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
    const {
      t, tReady, ipfsConnected, configIsLoading, configLastError, configIsSaving, arePinningServicesSupported,
      configSaveLastSuccess, configSaveLastError, isIpfsDesktop, analyticsEnabled, doToggleAnalytics, toursEnabled,
      handleJoyrideCallback, isCliTutorModeEnabled, doToggleCliTutorMode, ipfsPendingFirstConnection
    } = this.props
    const { hasErrors, hasLocalChanges, hasExternalChanges, editableConfig, editorKey } = this.state
    const hasSaveSucceded = this.isRecent(configSaveLastSuccess)
    const hasSaveFailed = this.isRecent(configSaveLastError)
    const isLoading = configIsLoading || (!editableConfig && !configLastError)

    return (
      <SettingsPage
        t={t}
        tReady={tReady}
        isIpfsConnected={ipfsConnected}
        ipfsPendingFirstConnection={ipfsPendingFirstConnection}
        isLoading={isLoading}
        isSaving={configIsSaving}
        arePinningServicesSupported={arePinningServicesSupported}
        hasSaveFailed={hasSaveFailed}
        hasSaveSucceded={hasSaveSucceded}
        hasErrors={hasErrors}
        hasLocalChanges={hasLocalChanges}
        hasExternalChanges={hasExternalChanges}
        config={editableConfig}
        editorKey={editorKey}
        onChange={this.onChange}
        onReset={this.onReset}
        onSave={this.onSave}
        isIpfsDesktop={isIpfsDesktop}
        analyticsEnabled={analyticsEnabled}
        doToggleAnalytics={doToggleAnalytics}
        toursEnabled={toursEnabled}
        handleJoyrideCallback={handleJoyrideCallback}
        doToggleCliTutorMode={doToggleCliTutorMode}
        isCliTutorModeEnabled={isCliTutorModeEnabled}
        command={cliCommandList[cliCmdKeys.UPDATE_IPFS_CONFIG]()}
      />
    )
  }
}

export const TranslatedSettingsPage = withTranslation('settings')(SettingsPageContainer)

export default connect(
  'selectConfig',
  'selectIpfsConnected',
  'selectIpfsPendingFirstConnection',
  'selectConfigLastError',
  'selectConfigIsLoading',
  'selectConfigIsSaving',
  'selectConfigSaveLastSuccess',
  'selectConfigSaveLastError',
  'selectIsIpfsDesktop',
  'selectToursEnabled',
  'selectAnalyticsEnabled',
  'selectArePinningServicesSupported',
  'doToggleAnalytics',
  'doSaveConfig',
  'selectIsCliTutorModeEnabled',
  'doToggleCliTutorMode',
  withTour(TranslatedSettingsPage)
)

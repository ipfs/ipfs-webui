import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import Radio from '../radio/radio.tsx'
import PublicGatewayForm from '../public-gateway-form/PublicGatewayForm.js'
import PublicSubdomainGatewayForm from '../public-subdomain-gateway-form/PublicSubdomainGatewayForm.js'
import { SHARE_LINK_TYPE, gatewayExample } from '../../lib/share-link.js'

const COMPANION_URL = 'https://docs.ipfs.tech/install/ipfs-companion/'
const GATEWAY_CHECKER_URL = 'https://ipfs.github.io/public-gateway-checker/'
const SELF_HOST_URL = 'https://docs.ipfs.tech/how-to/replace-public-gateways-with-self-hosted-ipfs/'
const ORIGIN_ISOLATION_URL = 'https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy'

// Native first (recommended), then the gateway options grouped after it.
const NATIVE_OPTION = { value: SHARE_LINK_TYPE.NATIVE, key: 'native', recommended: true, companion: true }
const GATEWAY_OPTIONS = [
  { value: SHARE_LINK_TYPE.LOCAL_PATH, key: 'localPath', subdomain: false },
  { value: SHARE_LINK_TYPE.LOCAL_SUBDOMAIN, key: 'localSubdomain', subdomain: true, isolation: true },
  { value: SHARE_LINK_TYPE.PUBLIC_PATH, key: 'publicPath', subdomain: false, Form: PublicGatewayForm },
  { value: SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN, key: 'publicSubdomain', subdomain: true, isolation: true, Form: PublicSubdomainGatewayForm }
]

const ShareLinkTypeForm = ({ t, shareLinkType, gatewayUrl, publicGateway, publicSubdomainGateway, doUpdateShareLinkType }) => {
  // A public option cannot be chosen until its gateway is configured below it.
  const disabledFor = {
    [SHARE_LINK_TYPE.PUBLIC_PATH]: !publicGateway,
    [SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN]: !publicSubdomainGateway
  }

  // The gateway each option's example is drawn from; native has none.
  const gatewayUrlFor = {
    [SHARE_LINK_TYPE.LOCAL_PATH]: gatewayUrl,
    [SHARE_LINK_TYPE.LOCAL_SUBDOMAIN]: gatewayUrl,
    [SHARE_LINK_TYPE.PUBLIC_PATH]: publicGateway,
    [SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN]: publicSubdomainGateway
  }

  const renderOption = ({ value, key, recommended, companion, isolation, subdomain, Form }) => {
    const disabled = Boolean(disabledFor[value])
    const checked = shareLinkType === value
    const exampleUrl = gatewayUrlFor[value]
    const example = exampleUrl ? gatewayExample(exampleUrl, { subdomain }) : ''
    return (
      <div key={value} className='mv3'>
        <div className={disabled ? 'o-40' : ''}>
          <Radio
            checked={checked}
            disabled={disabled}
            onChange={(isChecked) => { if (isChecked && !disabled) doUpdateShareLinkType(value) }}
            label={
              <span className='f6 fw6 charcoal'>
                {t(`shareLink.${key}.label`)}
                { recommended &&
                  <span className='dib ml2 ph2 pv1 f6 fw6 white bg-teal br2'>{t('shareLink.recommendedBadge')}</span> }
              </span>
            }
          />
          <p className='ma0 mt1 ml4 f6 charcoal-muted lh-copy'>{t(`shareLink.${key}.description`)}</p>
          { example &&
            <p className='ma0 mt1 ml4 f6 charcoal-muted lh-copy'>
              {t('shareLink.usesGateway')} <code className='f6 charcoal'>{example}</code>
            </p> }
          { companion &&
            <p className='ma0 mt1 ml4 f6 charcoal-muted lh-copy'>
              <Trans i18nKey='shareLink.native.companionNote' t={t}>
                <a className='link blue' href={COMPANION_URL} target='_blank' rel='noopener noreferrer'>IPFS Companion</a>
              </Trans>
            </p> }
          { isolation &&
            <p className='ma0 mt1 ml4 f6 charcoal-muted lh-copy'>
              <Trans i18nKey='shareLink.subdomainNote' t={t}>
                <a className='link blue' href={ORIGIN_ISOLATION_URL} target='_blank' rel='noopener noreferrer'>how browsers keep sites apart</a>
              </Trans>
            </p> }
        </div>
        { Form &&
          <div className='ml4 mt2'>
            { disabled &&
              <p className='ma0 mb2 f6 charcoal-muted lh-copy'>{t('shareLink.publicGatewayEmptyHint')}</p> }
            <Form />
          </div> }
      </div>
    )
  }

  // A plain div, not a form: the nested public gateway forms are real <form>
  // elements and forms cannot be nested. Radios apply on change, so no submit.
  return (
    <div>
      {renderOption(NATIVE_OPTION)}
      <p className='mt3 mb1 f6 fw6 charcoal'>{t('shareLink.gatewayGroupTitle')}</p>
      <p className='ma0 mb0 f6 charcoal-muted lh-copy'>{t('shareLink.gatewayGroupNote')}</p>
      {GATEWAY_OPTIONS.map(renderOption)}
      <p className='ma0 mt3 f6 charcoal-muted lh-copy'>
        <Trans i18nKey='shareLink.publicGatewayHelp' t={t}>
          <a className='link blue' href={GATEWAY_CHECKER_URL} target='_blank' rel='noopener noreferrer'>Public Gateway Checker</a>
          <a className='link blue' href={SELF_HOST_URL} target='_blank' rel='noopener noreferrer'>run your own</a>
        </Trans>
      </p>
    </div>
  )
}

export default connect(
  'selectShareLinkType',
  'selectGatewayUrl',
  'selectPublicGateway',
  'selectPublicSubdomainGateway',
  'doUpdateShareLinkType',
  withTranslation('settings')(ShareLinkTypeForm)
)

import React from 'react'
import { connect } from 'redux-bundler-react'
import Checkbox from '../checkbox/Checkbox'
import Box from '../../components/box/Box'
import Title from '../../settings/Title'

const Experiments = ({ doToggleAction, experiments, state, t }) => {
  // if there are no experiments to show don't render
  if (experiments && experiments.length > 0) {
    const isEnabled = key => (state[key] && state[key].enabled) || false
    const tkey = (selector, key) =>
      t(`Experiments.${key ? `${key}.${selector}` : `${selector}`}`)
    return (
      <Box className="mb3 pa4">
        <Title>{t('experiments')}</Title>
        <div className="flex flex-wrap pb3 lh-copy">
          {experiments.map(({ key, actionUrls }) => {
            const enabled = isEnabled(key)
            return (
              <div
                key={key}
                className="pa3 mr3 mb3 mw6 br3 bg-white dib f6 ba b1 b--light-gray"
              >
                <h3 className="aqua">{tkey('title', key)}</h3>
                <p className="charcoal">{tkey('description', key)}</p>
                <Checkbox
                  className="dib"
                  onChange={() => doToggleAction(key, enabled)}
                  checked={enabled}
                  label={<span className="fw5 f6">{tkey('label', key)}</span>}
                />
                {actionUrls && (
                  <div className="mv3">
                    {actionUrls.map((action, i) => (
                      <a
                        className={`link blue pr2 ${i > 0 &&
                          'bl b1 pl2 b--light-gray'}`}
                        href={action.url}
                      >
                        {tkey(action.key)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Box>
    )
  } else {
    return null
  }
}

export default connect(
  'selectIsIpfsDesktop',
  'selectExperiments',
  'selectState',
  'doToggleAction',
  Experiments
)

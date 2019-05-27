import React from 'react'
import { connect } from 'redux-bundler-react'
import Checkbox from '../checkbox/Checkbox'
import Box from '../../components/box/Box'
import Title from '../../settings/Title'

const Experiments = ({ doToggleAction, experiments, state, t }) => {
  // if there are no experiments to show don't render
  if (experiments && experiments.length > 0) {
    const isEnabled = key => state[key].enabled
    return (
      <Box className="mb3 pa4">
        <Title>{t('experiments')}</Title>
        <div className="flex flex-column pb3">
          {experiments.map(({ key, issueUrl }) => {
            const enabled = isEnabled(key)
            return (
              <div key={key}>
                <h1>{key}</h1>
                <p>{t(`Experiment_${key}.description`)}</p>
                <Checkbox
                  className="dib"
                  onChange={() => doToggleAction(key, enabled)}
                  checked={enabled}
                  label={
                    <span className="fw5 f6">
                      {t(`Experiment_${key}.label`)}
                    </span>
                  }
                />
                {issueUrl && (
                  <div className="mv3">
                    <a className="link blue" href={issueUrl}>
                      {t(`Experiment_${key}.issueUrl`)}
                    </a>
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

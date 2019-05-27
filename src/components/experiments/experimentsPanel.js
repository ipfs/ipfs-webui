import React from 'react'
import { connect } from 'redux-bundler-react'
import Checkbox from '../checkbox/Checkbox'
import Box from '../../components/box/Box'
import Title from '../../settings/Title'

const Experiments = ({
  isIpfsDesktop,
  doToggleAction,
  experiments,
  state,
  t,
  open
}) => {
  // if there are no experiments to show don't render
  if (experiments.length > 0) {
    const isEnabled = key => state[key].enabled
    return (
      <Box className="mb3 pa4">
        <Title>{t('experiments')}</Title>
        <div className="flex flex-column pb3">
          {experiments.map(({ key }) => {
            const enabled = isEnabled(key)
            return (
              <div key={key}>
                <h1>{key}</h1>
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

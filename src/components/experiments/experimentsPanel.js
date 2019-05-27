import React from 'react'
import { connect } from 'redux-bundler-react'
import Checkbox from '../checkbox/Checkbox'

const Experiments = ({
  isIpfsDesktop,
  doToggleAction,
  experiments,
  state,
  t,
  open
}) => {
  const isEnabled = key => state[key] && state[key].enabled
  return (
    <React.Fragment>
      {experiments.map(
        ({ key, desktop }) =>
          desktop === isIpfsDesktop && (
            <div key={key}>
              <h1>{key}</h1>
              <Checkbox
                className="dib"
                onChange={() => doToggleAction(key, isEnabled(key))}
                checked={isEnabled(key)}
                label={
                  <span className="fw5 f6">{t(`Experiment_${key}.label`)}</span>
                }
              />
            </div>
          )
      )}
    </React.Fragment>
  )
}

export default connect(
  'selectIsIpfsDesktop',
  'selectExperiments',
  'selectState',
  'doToggleAction',
  Experiments
)

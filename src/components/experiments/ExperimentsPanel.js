import React from 'react'
import { connect } from 'redux-bundler-react'
import Checkbox from '../checkbox/Checkbox.js'
import Box from '../box/Box.js'
import Title from '../../settings/Title.js'

const Experiments = ({ doExpToggleAction, experiments, t }) => {
  // if there are no experiments to show don't render
  if (experiments && experiments.length > 0) {
    const tkey = (selector, key) =>
      t(`Experiments.${key ? `${key}.${selector}` : `${selector}`}`)
    return (
      <Box className='mb3 pa4 lh-copy'>
        <Title>{t('experiments')}</Title>
        <p className='db mv4 f6 charcoal mw7'>{tkey('description')}</p>
        <div className='flex flex-wrap pb3'>
          {experiments.map(({ key, actionUrls, enabled, blocked }) => {
            return (
              <div
                key={key}
                className='pa3 mr3 mb3 mw6 br3 bg-white dib f6 ba b1 b--light-gray'
              >
                <h3>{tkey('title', key)}</h3>
                <p className='charcoal'>{tkey('description', key)}</p>
                <Checkbox
                  className='dib'
                  disabled={blocked}
                  onChange={() => doExpToggleAction(key, enabled)}
                  checked={enabled}
                  label={<span className='fw5 f6'>{tkey('label', key)}</span>}
                />
                {actionUrls && (
                  <div className='mv3'>
                    {actionUrls.map((action, i) => (
                      <a
                        target='_blank'
                        rel='noopener noreferrer'
                        key={action.key}
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
  'selectExperiments',
  'doExpToggleAction',
  Experiments
)

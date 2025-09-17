import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Speedometer from './Speedometer.js'
import { Title } from './Commons.js'

class NetworkTraffic extends React.Component {
  state = {
    commonTotal: 125000, // Initial scale: 1 Mbit/s (125000 bytes/s)
    downFilled: 0,
    upFilled: 0
  }

  componentDidUpdate (_, prevState) {
    const { nodeBandwidth } = this.props

    const down = nodeBandwidth ? Math.trunc(Number(nodeBandwidth.rateIn) || 0) : 0
    const up = nodeBandwidth ? Math.trunc(Number(nodeBandwidth.rateOut) || 0) : 0

    if (down !== prevState.downFilled || up !== prevState.upFilled) {
      // Combined bandwidth to determine scale needed for both meters
      const combinedNow = down + up
      // Keep the maximum scale seen so far to prevent jarring visual changes
      // when bandwidth drops (meters stay proportional to historical peak)
      const nextCommonTotal = Math.max(prevState.commonTotal, combinedNow)

      this.setState({
        downFilled: down,
        upFilled: up,
        commonTotal: nextCommonTotal
      })
    }
  }

  render () {
    const { t } = this.props
    const { downFilled, upFilled, commonTotal } = this.state

    return (
      <div>
        <Title>{t('networkTraffic')}</Title>
        <div className='flex flex-column justify-between' style={{ maxWidth: 400 }}>
          <div className='mh2 mv3 mt0-l'>
            <Speedometer
              title={t('app:terms.downSpeed')}
              color='#69c4cd'
              filled={downFilled}
              total={commonTotal}
            />
          </div>
          <div className='mh2 mt3 mt0-l'>
            <Speedometer
              title={t('app:terms.upSpeed')}
              color='#f39021'
              filled={upFilled}
              total={commonTotal}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  'selectNodeBandwidth',
  withTranslation('status')(NetworkTraffic)
)

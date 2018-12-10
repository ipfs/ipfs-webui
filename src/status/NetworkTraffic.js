import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import Speedometer from './Speedometer'
import { Title } from './Commons'

class NetworkTraffic extends React.Component {
  state = {
    downSpeed: {
      filled: 0,
      total: 125000 // Starts with 1 Mb/s max
    },
    upSpeed: {
      filled: 0,
      total: 125000 // Starts with 1 Mb/s max
    }
  }

  componentDidUpdate (_, prevState) {
    const { stats } = this.props
    const down = stats ? parseInt(stats.bw.rateIn.toFixed(0), 10) : 0
    const up = stats ? parseInt(stats.bw.rateOut.toFixed(0), 10) : 0

    if (down !== prevState.downSpeed.filled || up !== prevState.upSpeed.filled) {
      this.setState({
        downSpeed: {
          filled: down,
          total: Math.max(down, prevState.downSpeed.total)
        },
        upSpeed: {
          filled: up,
          total: Math.max(up, prevState.upSpeed.total)
        }
      })
    }
  }

  render () {
    const { t } = this.props
    const { downSpeed, upSpeed } = this.state

    return (
      <div>
        <Title>{t('networkTraffic')}</Title>
        <div className='flex flex-column justify-between' style={{ maxWidth: 400 }}>
          <div className='mr2 ml2 mt3 mt0-l'>
            <Speedometer
              title={t('upSpeed')}
              color='#f39021'
              {...upSpeed} />
          </div>
          <div className='mr2 ml2 mt3 mt0-l'>
            <Speedometer
              title={t('downSpeed')}
              color='#69c4cd'
              {...downSpeed} />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  'selectStats',
  translate('status')(NetworkTraffic)
)

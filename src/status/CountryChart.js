import React from 'react'
import { withTranslation } from 'react-i18next'
import { Title } from './Commons.js'
import { Pie } from 'react-chartjs-2'
import { connect } from 'redux-bundler-react'
import { getChartColors } from '../lib/chart-colors.js'

const CountryChart = ({ t, peerLocations, effectiveTheme, className }) => {
  const countryLabels = {}
  const countsByCountry = {}

  Object.keys(peerLocations).forEach(peerId => {
    const { country_code: code, country_name: label } = peerLocations[peerId]
    countsByCountry[code] = (countsByCountry[code] || 0) + 1
    countryLabels[code] = label
  })

  const countryRanking = Object.keys(countsByCountry).sort((a, b) => {
    return countsByCountry[b] - countsByCountry[a]
  })

  const totalCountries = Object.keys(peerLocations).length

  let data

  if (countryRanking.length < 5) {
    data = countryRanking
      .map(code => Math.round((countsByCountry[code] / totalCountries) * 100))
  } else {
    data = countryRanking
      .slice(0, 3)
      .map(code => Math.round((countsByCountry[code] / totalCountries) * 100))

    data = data.concat(100 - data.reduce((total, p) => total + p))
  }

  const chartColors = getChartColors(effectiveTheme)
  const datasets = [{
    data,
    backgroundColor: chartColors.countries,
    label: 'Peer Countries'
  }]

  const options = {
    responsive: true,
    legend: {
      display: true,
      position: 'bottom'
    },
    tooltips: {
      displayColors: false,
      callbacks: {
        title: (tooltipItem, data) => data.labels[tooltipItem[0].index],
        label: (tooltipItem, data) => {
          const percent = data.datasets[0].data[tooltipItem.index]
          const count = Math.round((percent * totalCountries) / 100)

          return t('pieChartLabel', { percent, count })
        }
      }
    }
  }

  let labels

  if (countryRanking.length < 5) {
    labels = countryRanking.map(code => countryLabels[code])
  } else {
    labels = countryRanking
      .slice(0, 3)
      .map(code => countryLabels[code])
      .concat('Other')
  }

  return (
    <div>
      <Title>
        <a className='link aqua' href='#/peers'>{t('distributionOfPeers')}</a>
      </Title>
      <div className='nl3 nr3'>
        <Pie data={{ datasets, labels }} options={options} />
      </div>
    </div>
  )
}

export default connect(
  'selectPeerLocations',
  'selectEffectiveTheme',
  withTranslation('status')(CountryChart)
)

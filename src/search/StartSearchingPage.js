import React from 'react'
import { Helmet } from 'react-helmet'
import { Trans, withTranslation } from 'react-i18next'

class ErrorBoundary extends React.Component {
  state = {
    hasError: false
  }

  componentDidCatch (error, info) {
    this.setState({ hasError: true })
    console.log(error)
  }

  render () {
    const { hasError } = this.state
    const { children, fallback: Fallback } = this.props
    return hasError ? <Fallback /> : children
  }
}

const Box = ({
  className = 'pa4',
  style,
  children,
  ...props
}) => {
  return (
    <div className={className} style={{ background: '#fbfbfb', ...style }}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  )
}

const AboutIpfsSearch = ({ t }) => {
  return (
    <Box className='tl dib pa4 avenir measure-wide-l lh-copy dark-gray ba-l b--black-10'>
      <Trans i18nKey='AboutSearch.paragraph1' t={t}>
        <p>IPFS <strong>powers the distributed web.</strong> It is a peer-to-peer hypermedia protocol designed to preserve and grow humanity's knowledge by making the web upgradeable, resilient, and more open.</p>
      </Trans>
      <Trans i18nKey='AboutSearch.paragraph2' t={t}>
        <p> <strong>ipfs-search</strong> listens to IPFS nodes and extracts hashes from the DHT (distributed hash table) gossip. A crawler uses the hashes to collect data to be indexed.</p>
      </Trans>
      <Trans i18nKey='AboutSearch.paragraph3' t={t}>
        <p>The search engine is free, open source, and allows you to search the Interplanetary File System through a regular search engine interface.</p>
      </Trans>
    </Box>
  )
}

const StartSearchingPage = ({ t, embed, runTour = false, joyrideCallback }) => (
  <div className='mw9 center explore-sug-2'>
    <Helmet>
      <title>{t('StartSearchingPage.title')}</title>
    </Helmet>
    <div className='flex-l'>
      <div className='flex-auto-l mr3-l'>
        <div className='pl3 pl0-l pt4 pt2-l'>
          <h1 className='f3 f2-l ma0 fw4 montserrat charcoal'>{t('StartSearchingPage.header')}</h1>
          <p className='lh-copy f5 avenir charcoal-muted'>{t('StartSearchingPage.leadParagraph')}</p>
        </div>
        <img src='https://ipfs.io/ipfs/QmQDDBnfoeqjGCLss9iZx21AAfETyTPsb19c5kRec3AbA1?filename=ipfs-search-arch-inv.png' alt='ipfs-search architecture' />
      </div>
      <div className='pt2-l'>
        <AboutIpfsSearch t={t} />
      </div>
    </div>

    {/* <ReactJoyride
      run={runTour}
      steps={projectsTour.getSteps({ t })}
      styles={projectsTour.styles}
      callback={joyrideCallback}
      scrollToFirstStep
    /> */}
  </div>
)

/* TODO: add dag-cbor and raw block examples
          <li>
            <ExploreSuggestion name='DAG-CBOR Block' cid='bafyreicnokmhmrnlp2wjhyk2haep4tqxiptwfrp2rrs7rzq7uk766chqvq' type='dag-cbor' />
          </li>
          <li>
            <ExploreSuggestion name='Raw Block for "hello"' cid='bafkreibm6jg3ux5qumhcn2b3flc3tyu6dmlb4xa7u5bf44yegnrjhc4yeq' type='raw' />
          </li>
*/

export default withTranslation('search')(StartSearchingPage)

/* eslint-disable space-before-function-paren */
import React from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
// import ErrorBoundary from './error/ErrorBoundary'
// import CidInfo from './cid-info/CidInfo'
import ObjectInfo from './object-info/ObjectInfo'
// import IpldGraph from './graph/LoadableIpldGraph'
import GraphCrumb from './graph-crumb/GraphCrumb'
import ComponentLoader from './loader/ComponentLoader'
import ReactJoyride from 'react-joyride'
import { explorerTour } from '../lib/tours'

export class ExplorePage extends React.Component {
  render() {
    let { t, explore, exploreIsLoading, explorePathFromHash, doExploreLink, runTour = false, joyrideCallback, gatewayUrl = 'https://ipfs.io' } = this.props

    if (!explorePathFromHash) {
      // No IPLD path to explore so show the intro page
      console.log('[IPLD Explorer] ExplorePage loaded without a path to explore')
      return null
    }

    // Hide the old data while we navigate to the new. We can get much fancier
    // with showing that the request is loading, but for now, this'l hide the
    // now stale info and show a loading spinner.
    explore = explore || {}
    explore = exploreIsLoading ? {} : explore

    const { error, targetNode, localPath, nodes, pathBoundaries } = explore
    const sourceNode = (nodes && nodes[0]) || null

    return (
      <div>
        <Helmet>
          <title>{t('ExplorePage.title')}</title>
        </Helmet>

        {pathBoundaries && targetNode
          ? (
            <GraphCrumb
              className='joyride-explorer-crumbs pb3 pl1'
              cid={sourceNode.cid}
              pathBoundaries={pathBoundaries}
              localPath={localPath}
            />
          )
          : <div style={{ height: 54 }} />}

        <div className='dt-l dt--fixed'>
          <div className='w-100 v-top'>

            {targetNode
              ? (
                <ObjectInfo
                  className='joyride-explorer-node'
                  // style={{ background: '#1E1E1E', border: '3px solid', borderLeftColor: '#464646', borderRightColor: 'white', borderTopColor: '#464646', borderBottomColor: 'white' }}
                  hideTitle={true}
                  cid={targetNode.cid}
                  localPath={localPath}
                  size={targetNode.size}
                  links={targetNode.links}
                  data={targetNode.data}
                  type={targetNode.type}
                  format={targetNode.format}
                  onLinkClick={doExploreLink}
                  gatewayUrl={gatewayUrl}
                />
              )
              : null}

            {!error && !targetNode
              ? <ComponentLoader pastDelay bg='transparent' color='white'/>
              : null}
          </div>
          {/*
          <div className='v-top mv3 flex' style={{
            background: '#1E1E1E',
            overflow: 'hidden',
            border: '3px solid',
            borderTopColor: '#464646',
            borderLeftColor: '#464646',
            borderBottomColor: '#FFFFFF',
            borderRightColor: '#FFFFFF'
          }}>
            {error ? (
              <div style={{ background: '#D95151' }} className='w-100 w95fa white pa2 ph3 lh-copy'>
                {error}
              </div>
            ) : null}
            {targetNode
              ? (
                <CidInfo
                  className='joyride-explorer-cid w-100'

                  cid={targetNode.cid}
                />
              )
              : null}

            {targetNode
              ? (
                <ErrorBoundary>
                  <IpldGraph
                    className='joyride-explorer-graph self-center bg-black-10'
                    style={{ height: 300, width: 300, minWidth: 300 }}
                    path={targetNode.cid}
                    links={targetNode.links}
                    onNodeClick={doExploreLink}
                  />
                </ErrorBoundary>
              )
              : null}
          </div> */}
        </div>

        <ReactJoyride
          run={runTour}
          steps={explorerTour.getSteps({ t })}
          styles={explorerTour.styles}
          callback={joyrideCallback}
          continuous
          scrollToFirstStep
          showProgress
        />
      </div>
    )
  }
}

export default connect(
  'selectExplore',
  'selectExploreIsLoading',
  'selectExplorePathFromHash',
  'doExploreLink',
  withTranslation('explore')(ExplorePage)
)

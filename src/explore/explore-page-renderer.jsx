import React, { useEffect } from 'react';
import { connect } from 'redux-bundler-react';
import LoadableExplorePage from './LoadableExplorePage';
import LoadableStartExploringPage from './LoadableStartExploringPage';
import { useExplore, useHelia } from 'ipld-explorer-components/providers';
import 'ipld-explorer-components/css';

const ExplorePageRenderer = ({ routeInfo }) => {
  const { pattern, url } = routeInfo;
  const { setExplorePath } = useExplore();
  const { doInitHelia, helia } = useHelia();

  useEffect(() => {
    if (helia == null) {
      doInitHelia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helia]);

  useEffect(() => {
    setExplorePath(window.location.hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (pattern === '/explore') {
    return <LoadableStartExploringPage />;
  }

  return <LoadableExplorePage />;
};

export default connect('selectRouteInfo', ExplorePageRenderer);

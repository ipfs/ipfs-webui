import { createSelector } from 'redux-bundler'
import createRouteMatcher from 'feather-route-matcher'
import StatusPage from '../status/StatusPage'
import FilesPage from '../files/FilesPage'
import IpldPage from '../ipld/IpldPage'
import PeersPage from '../peers/PeersPage'
import SettingsPage from '../settings/SettingsPage'

function createRouteBundle (routes, routeInfoSelector = 'selectPathname') {
  return {
    name: 'routes',
    selectRouteInfo: createSelector(routeInfoSelector, createRouteMatcher(routes)),
    selectRouteParams: createSelector('selectRouteInfo', ({ params }) => params),
    selectRoute: createSelector('selectRouteInfo', ({ page }) => page)
  }
}

export default createRouteBundle({
  '/files': FilesPage,
  '/ipld': IpldPage,
  '/ipld/:path': IpldPage,
  '/peers': PeersPage,
  '/settings': SettingsPage,
  '/': StatusPage,
  '': StatusPage
}, 'selectHash')

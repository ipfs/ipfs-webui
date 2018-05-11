import { createRouteBundle } from 'redux-bundler'
import StatusPage from '../status/StatusPage'
import FilesPage from '../files/FilesPage'
import IpldPage from '../ipld/IpldPage'
import PeersPage from '../peers/PeersPage'
import SettingsPage from '../settings/SettingsPage'

export default createRouteBundle({
  '/files': FilesPage,
  '/ipld': IpldPage,
  '/ipld/:path': IpldPage,
  '/peers': PeersPage,
  '/settings': SettingsPage,
  '/': StatusPage,
  '': StatusPage
}, { routeInfoSelector: 'selectHash' })

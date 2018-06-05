import { createRouteBundle } from 'redux-bundler'
import StatusPage from '../status/StatusPage'
import FilesPage from '../files/FilesPage'
import IpldPage from '../ipld/IpldPage'
import PeersPage from '../peers/PeersPage'
import SettingsPage from '../settings/SettingsPage'

export default createRouteBundle({
  '/files': FilesPage,
  '/explore*': IpldPage,
  '/files*': FilesPage,
  '/peers': PeersPage,
  '/settings': SettingsPage,
  '/': StatusPage,
  '': StatusPage
}, { routeInfoSelector: 'selectHash' })

import { createRouteBundle } from 'redux-bundler'
import StatusPage from '../status/StatusPage'
import FilesPage from '../files/FilesPage'
import ExplorePage from '../explore/ExplorePage'
import PeersPage from '../peers/PeersPage'
import SettingsPage from '../settings/SettingsPage'

export default createRouteBundle({
  '/files': FilesPage,
  '/explore*': ExplorePage,
  '/peers': PeersPage,
  '/settings': SettingsPage,
  '/': StatusPage,
  '': StatusPage
}, { routeInfoSelector: 'selectHash' })

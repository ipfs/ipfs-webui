import { createRouteBundle } from 'redux-bundler'
import StatusPage from '../status/StatusPage'
import FilesPage from '../files/LoadableFilesPage'
import ExplorePage from '../explore/ExplorePage'
import PeersPage from '../peers/PeersPage'
import SettingsPage from '../settings/LoadableSettingsPage'

export default createRouteBundle({
  '/explore*': ExplorePage,
  '/files*': FilesPage,
  '/peers': PeersPage,
  '/settings': SettingsPage,
  '/': StatusPage,
  '': StatusPage
}, { routeInfoSelector: 'selectHash' })

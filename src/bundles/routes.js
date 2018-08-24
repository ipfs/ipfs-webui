import { createRouteBundle } from 'redux-bundler'
import StatusPage from '../status/LoadableStatusPage'
import FilesPage from '../files/LoadableFilesPage'
import ExplorePage from '../explore/LoadableExplorePage'
import PeersPage from '../peers/LoadablePeersPage'
import SettingsPage from '../settings/LoadableSettingsPage'
import WelcomePage from '../welcome/LoadableWelcomePage'

export default createRouteBundle({
  '/explore*': ExplorePage,
  '/files*': FilesPage,
  '/peers': PeersPage,
  '/settings': SettingsPage,
  '/welcome': WelcomePage,
  '/': StatusPage,
  '': StatusPage
}, { routeInfoSelector: 'selectHash' })

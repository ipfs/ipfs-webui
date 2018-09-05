import { createRouteBundle } from 'redux-bundler'
import StatusPage from '../status/LoadableStatusPage'
import FilesPage from '../files/LoadableFilesPage'
import { ExplorePage, StartExploringPage } from 'ipld-explorer-components'
import PeersPage from '../peers/LoadablePeersPage'
import SettingsPage from '../settings/LoadableSettingsPage'
import WelcomePage from '../welcome/LoadableWelcomePage'

export default createRouteBundle({
  '/explore': StartExploringPage,
  '/explore*': ExplorePage,
  '/files*': FilesPage,
  '/peers': PeersPage,
  '/settings': SettingsPage,
  '/welcome': WelcomePage,
  '/': StatusPage,
  '': StatusPage
}, { routeInfoSelector: 'selectHash' })

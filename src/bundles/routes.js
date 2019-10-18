import { createRouteBundle } from 'redux-bundler'
import StatusPage from '../status/LoadableStatusPage'
import FilesPage from '../files/LoadableFilesPage'
import StartExploringPage from '../explore/LoadableStartExploringPage'
import ExplorePage from '../explore/LoadableExplorePage'
import PeersPage from '../peers/LoadablePeersPage'
import SettingsPage from '../settings/LoadableSettingsPage'
import AnalyticsPage from '../settings/AnalyticsPage'
import WelcomePage from '../welcome/LoadableWelcomePage'
import BlankPage from '../blank/BlankPage'

export default createRouteBundle({
  '/explore': StartExploringPage,
  '/explore*': ExplorePage,
  '/files*': FilesPage,
  '/ipfs*': FilesPage,
  '/ipns*': FilesPage,
  '/pins*': FilesPage,
  '/peers': PeersPage,
  '/settings': SettingsPage,
  '/settings/analytics': AnalyticsPage,
  '/welcome': WelcomePage,
  '/blank': BlankPage,
  '/': StatusPage,
  '': StatusPage
}, { routeInfoSelector: 'selectHash' })

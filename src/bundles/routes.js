import { createRouteBundle } from 'redux-bundler'
import StatusPage from '../status/LoadableStatusPage.js'
import FilesPage from '../files/LoadableFilesPage.js'
import PinsPage from '../pins/LoadablePinsPage.js'
import StartExploringPage from '../explore/LoadableStartExploringPage.js'
import ExplorePage from '../explore/LoadableExplorePage.js'
import PeersPage from '../peers/LoadablePeersPage.js'
import SettingsPage from '../settings/LoadableSettingsPage.js'
import AnalyticsPage from '../settings/AnalyticsPage.js'
import WelcomePage from '../welcome/LoadableWelcomePage.js'
import BlankPage from '../blank/BlankPage.js'

export default createRouteBundle({
  '/explore': StartExploringPage,
  '/explore*': ExplorePage,
  '/files*': FilesPage,
  '/ipfs*': FilesPage,
  '/ipns*': FilesPage,
  '/pins*': PinsPage,
  '/peers': PeersPage,
  '/settings/analytics': AnalyticsPage,
  '/settings*': SettingsPage,
  '/welcome': WelcomePage,
  '/blank': BlankPage,
  '/status*': StatusPage,
  '/': StatusPage,
  '': StatusPage
}, { routeInfoSelector: 'selectHash' })

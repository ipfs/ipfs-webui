import { createRouteBundle } from 'redux-bundler'
import StatusPage from '../status/loadable-status-page.js'
import FilesPage from '../files/loadable-files-page.js'
import PinsPage from '../pins/loadable-pins-page.js'
import PeersPage from '../peers/loadable-peers-page.js'
import SettingsPage from '../settings/loadable-settings-page.js'
import AnalyticsPage from '../settings/analytics-page.js'
import WelcomePage from '../welcome/loadable-welcome-page.js'
import BlankPage from '../blank/blank-page.js'
import ExplorePageRenderer from '../explore/explore-page-renderer.jsx'

export default createRouteBundle({
  '/explore': ExplorePageRenderer,
  '/explore*': ExplorePageRenderer,
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

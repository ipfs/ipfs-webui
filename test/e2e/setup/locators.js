/**
 * Centralized locator definitions for IPFS WebUI E2E tests.
 *
 * These factory functions return locators for common UI elements.
 * Using semantic selectors (roles, labels, testids) over CSS where possible.
 *
 * Usage:
 *   import { nav, files, settings } from './setup/locators.js'
 *   await nav.status(page).click()
 *   await files.importButton(page).click()
 */

// Navigation menu locators
// Note: NavBar uses role="menuitem" for nav links
export const nav = {
  status: (page) => page.getByRole('menuitem', { name: 'Status' }),
  files: (page) => page.getByRole('menuitem', { name: 'Files' }),
  explore: (page) => page.getByRole('menuitem', { name: 'Explore' }),
  peers: (page) => page.getByRole('menuitem', { name: 'Peers' }),
  settings: (page) => page.getByRole('menuitem', { name: 'Settings' })
}

// Files page locators
export const files = {
  importButton: (page) => page.locator('button[id="import-button"]'),
  addFileOption: (page) => page.locator('button#add-file'),
  addFolderOption: (page) => page.locator('button#add-folder'),
  addByPathOption: (page) => page.locator('button#add-by-path'),
  addNewFolderOption: (page) => page.locator('button#add-new-folder'),
  filesList: (page) => page.locator('.FilesList'),
  filesGrid: (page) => page.locator('.files-grid'),

  // File rows - using .File class which is the standard file row
  fileRow: (page, name) => page.locator('.File').filter({ hasText: name }),
  fileRowByTestId: (page) => page.getByTestId('file-row'),
  gridFile: (page) => page.locator('.grid-file'),
  gridFileByName: (page, name) => page.locator('.grid-file').filter({ hasText: name }),

  // Context menu
  contextMenuButton: (page, name) => page.locator(`button[aria-label="View more options for ${name}"]`),
  contextMenuItem: (page, text) => page.locator('button[role="menuitem"]').filter({ hasText: text }),

  // Search filter
  searchToggle: (page) => page.getByRole('button', { name: 'Click to show search filter' }),
  searchInput: (page) => page.locator('input[aria-label="Filter by name or CID…"]'),
  searchClearButton: (page) => page.getByRole('button', { name: 'Clear search' }),

  // Dialogs
  dialog: (page) => page.locator('div[role="dialog"]'),
  dialogInput: (page, name) => page.locator(`div[role="dialog"] input[name="${name}"]`),
  modalInput: (page) => page.locator('input.modal-input')
}

// Settings page locators
export const settings = {
  publicSubdomainGateway: (page) => page.locator('#public-subdomain-gateway'),
  publicPathGateway: (page) => page.locator('#public-gateway'),
  apiAddress: (page) => page.locator('#api-address'),
  submitButton: (page, id) => page.locator(`#${id}`),
  resetButton: (page, id) => page.locator(`#${id}`),
  languageChangeButton: (page) => page.locator('.e2e-languageSelector-changeBtn'),
  languageModal: (page) => page.locator('.e2e-languageModal'),
  languageOption: (page, lang) => page.locator(`.e2e-languageModal-lang_${lang}`),
  currentLanguage: (page) => page.locator('.e2e-languageSelector-current')
}

// Peers page locators
export const peers = {
  addConnectionButton: (page) => page.getByText('Add connection'),
  modal: (page) => page.getByTestId('ipfs-modal'),
  multiAddrInput: (page) => page.locator('input[name="maddr"]'),
  successIndicator: (page) => page.locator('.bg-green'),
  localNetwork: (page) => page.getByText('Local Network'),
  filterInput: (page) => page.locator('#peers-filter-input')
}

// Explore page locators
export const explore = {
  form: (page) => page.locator('[data-id="FilesExploreForm"]'),
  cidInput: (page) => page.locator('[data-id="FilesExploreForm"] input[id="ipfs-path"]'),
  inspectButton: (page) => page.locator('[data-id="FilesExploreForm"] button[title="Inspect"]'),
  browseButton: (page) => page.locator('[data-id="FilesExploreForm"] button[title="Browse"]'),
  cidInfo: (page) => page.locator('.joyride-explorer-cid'),
  humanReadableCid: (page) => page.locator('#CidInfo-human-readable-cid'),
  connectionIndicator: (page) => page.locator('.joyride-app-status .teal')
}

// Status page locators
export const status = {
  connectionStatus: (page) => page.getByText('Connected to IPFS'),
  statusMenuItem: (page) => page.getByText('Status'),
  httpApiAddress: (page) => page.locator('div[id="http-api-address"]'),
  detailsSummary: (page) => page.locator('summary')
}

// IPNS related locators
export const ipns = {
  generateKeyButton: (page) => page.getByText('Generate Key'),
  publishModalKeys: (page) => page.locator('div[role="dialog"] .publishModalKeys'),
  keyRow: (page, name) => page.getByText(name),
  keyOptionsButton: (page, name, id) => page.locator(`text=${name}${id} >> [aria-label="Show options"]`),
  removeMenuItem: (page) => page.locator('button[role="menuitem"]').filter({ hasText: 'Remove' }),
  publishButton: (page) => page.getByRole('button', { name: 'Publish' }),
  doneButton: (page) => page.getByRole('button', { name: 'Done' })
}

// Common modal/dialog locators
export const modal = {
  container: (page) => page.getByTestId('ipfs-modal'),
  closeButton: (page) => page.getByRole('button', { name: 'Close' }),
  confirmButton: (page, text = 'Confirm') => page.getByRole('button', { name: text }),
  input: (page) => page.locator('input.modal-input')
}

// Import notification locators and helper
export const importNotification = {
  container: (page) => page.locator('.fileImportStatus'),
  closeButton: (page) => page.locator('.fileImportStatusCancel')
}

/**
 * Dismiss the import notification if visible.
 * Useful when the notification overlay can block clicks on other UI elements.
 */
export async function dismissImportNotification (page) {
  const closeBtn = importNotification.closeButton(page)
  if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeBtn.click()
    await importNotification.container(page).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  }
}

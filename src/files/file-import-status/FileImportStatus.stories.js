import React from 'react'

import { action } from '@storybook/addon-actions'
import {
  withKnobs
  // , boolean
} from '@storybook/addon-knobs'
import i18nDecorator from '../../i18n-decorator.js'
import { FileImportStatus } from './FileImportStatus.js'
import i18n from '../../i18n.js'
import { Array } from 'window-or-global'

const containerStyle = { width: 156 }

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/FileImportStatus',
  decorators: [i18nDecorator, withKnobs]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ImportASingleFileExpandedInProgress = () => (
  <div className="sans-serif vh-80 bg-navy" style={containerStyle}>
    <FileImportStatus
      t={i18n.getFixedT('en', 'files')}
      doFilesClear={action('clear files')}
      filesPending={[
        {
          start: 1601069562246,
          status: 'Pending',
          message: {
            progress: 30,
            entries: [catFile]
          }
        }
      ]}
    />
  </div>
)

ImportASingleFileExpandedInProgress.story = {
  name: 'Import a single file (expanded, in progress)'
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ImportASingleFileCollapsedInProgress = () => (
  <div className="sans-serif vh-80 bg-navy" style={containerStyle}>
    <FileImportStatus
      t={i18n.getFixedT('en', 'files')}
      doFilesClear={action('clear files')}
      initialExpanded={false}
      filesPending={[
        {
          start: 1601069562246,
          status: 'Pending',
          message: {
            progress: 30,
            entries: [catFile]
          }
        }
      ]}
    />
  </div>
)

ImportASingleFileCollapsedInProgress.story = {
  name: 'Import a single file (collapsed, in progress)'
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ImportASingleFileExpandedComplete = () => (
  <div className="sans-serif vh-80 bg-navy" style={containerStyle}>
    <FileImportStatus
      t={i18n.getFixedT('en', 'files')}
      doFilesClear={action('clear files')}
      filesFinished={[
        {
          status: 'Done',
          start: 1601069562246,
          end: 1601069572246,
          message: {
            progress: 100,
            entries: [catFile]
          }
        }
      ]}
    />
  </div>
)

ImportASingleFileExpandedComplete.story = {
  name: 'Import a single file (expanded, complete)'
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ImportMultipleFilesExpandedInProgress = () => (
  <div className="sans-serif vh-80 bg-navy" style={containerStyle}>
    <FileImportStatus
      t={i18n.getFixedT('en', 'files')}
      doFilesClear={action('clear files')}
      filesPending={[
        {
          start: 1601069562246,
          status: 'Pending',
          message: {
            progress: 30,
            entries: [catFile]
          }
        }
      ]}
      filesFinished={[
        {
          status: 'Done',
          start: 1601069562246,
          end: 1601069572246,
          message: {
            progress: 100,
            entries: [novelFile]
          }
        },
        {
          status: 'Done',
          start: 1601069562246,
          end: 1601069572246,
          message: {
            progress: 100,
            entries: [...dirOfFiles]
          }
        }
      ]}
    />
  </div>
)

ImportMultipleFilesExpandedInProgress.story = {
  name: 'Import multiple files (expanded, in progress)'
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ImportMultipleFilesCollapsedInProgress = () => (
  <div className="sans-serif vh-80 bg-navy" style={containerStyle}>
    <FileImportStatus
      t={i18n.getFixedT('en', 'files')}
      doFilesClear={action('clear files')}
      initialExpanded={false}
      filesPending={new Array(54).fill(null).map(() => ({
        start: 1601069562246,
        status: 'Pending',
        message: {
          progress: Math.round(Math.random() * 100),
          entries: [
            {
              path: Math.random().toString(36).slice(2),
              size: Math.round(Math.random() * 1000)
            }
          ]
        }
      }))}
      filesFinished={[
        {
          status: 'Done',
          start: 1601069562246,
          end: 1601069572246,
          message: {
            progress: 100,
            entries: [novelFile]
          }
        },
        {
          status: 'Done',
          start: 1601069562246,
          end: 1601069572246,
          message: {
            progress: 100,
            entries: [...dirOfFiles]
          }
        }
      ]}
    />
  </div>
)

ImportMultipleFilesCollapsedInProgress.story = {
  name: 'Import multiple files (collapsed, in progress)'
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ImportMultipleFilesExpandedComplete = () => (
  <div className="sans-serif vh-80 bg-navy" style={containerStyle}>
    <FileImportStatus
      t={i18n.getFixedT('en', 'files')}
      doFilesClear={action('clear files')}
      filesFinished={new Array(54).fill(null).map(() => ({
        start: 1601069562246,
        status: 'Done',
        message: {
          progress: Math.round(Math.random() * 100),
          entries: [
            {
              path: Math.random().toString(36).slice(2),
              size: Math.round(Math.random() * 1000)
            }
          ]
        }
      }))}
    />
  </div>
)

ImportMultipleFilesExpandedComplete.story = {
  name: 'Import multiple files (expanded, complete)'
}

const catFile = {
  path: 'awesome-cat-image-that-is-extermely-awesome.gif',
  size: 2.1e6
}

const novelFile = {
  path: 'my-nover.docx',
  size: 12200
}

const dirOfFiles = [
  {
    path: 'folder full of files/readme.md',
    size: 0.2e6
  },
  {
    path: 'folder full of files/chapter-1.md',
    size: 1.1e6
  },
  {
    path: 'folder full of files/chapter-2.md',
    size: 1.1e6
  }
]

// /**
//  * @type {import('@storybook/react').Meta}
//  */
// const FileImportStatusStory = {
//   title: 'Files/FileImportStatus',
//   component: FileImportStatus
// }

// export default FileImportStatusStory

// /**
//  * @type {import('@storybook/react').StoryObj}
//  */
// export const Default = {}

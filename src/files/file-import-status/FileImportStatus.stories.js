
import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import {
  withKnobs
  // , boolean
} from '@storybook/addon-knobs'
import i18nDecorator from '../../i18n-decorator'
import { FileImportStatus } from './FileImportStatus'
import i18n from '../../i18n'
import { Array } from 'window-or-global'

const containerStyle = { width: 156 }

storiesOf('Files/FilImportStatus', module)
  .addDecorator(i18nDecorator)
  .addDecorator(checkA11y)
  .addDecorator(withKnobs)
  .add('Import a single file (expanded, in progress)', () => (
    <div className='sans-serif vh-80 bg-navy' style={containerStyle}>
      <FileImportStatus
        t={i18n.getFixedT('en', 'files')}
        doFilesClear={action('clear files')}
        filesPending={[
          {
            start: 1601069562246,
            status: 'Pending',
            message: {
              progress: 30,
              entries: [
                catFile
              ]
            }
          }
        ]}
      />
    </div>
  ))
  .add('Import a single file (collapsed, in progress)', () => (
    <div className='sans-serif vh-80 bg-navy' style={containerStyle}>
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
              entries: [
                catFile
              ]
            }
          }
        ]}
      />
    </div>
  ))
  .add('Import a single file (expanded, complete)', () => (
    <div className='sans-serif vh-80 bg-navy' style={containerStyle}>
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
              entries: [
                catFile
              ]
            }
          }
        ]}
      />
    </div>
  ))
  .add('Import multiple files (expanded, in progress)', () => (
    <div className='sans-serif vh-80 bg-navy' style={containerStyle}>
      <FileImportStatus
        t={i18n.getFixedT('en', 'files')}
        doFilesClear={action('clear files')}
        filesPending={[
          {
            start: 1601069562246,
            status: 'Pending',
            message: {
              progress: 30,
              entries: [
                catFile
              ]
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
              entries: [
                novelFile
              ]
            }
          },
          {
            status: 'Done',
            start: 1601069562246,
            end: 1601069572246,
            message: {
              progress: 100,
              entries: [
                ...dirOfFiles
              ]
            }
          }
        ]}
      />
    </div>
  ))
  .add('Import multiple files (collapsed, in progress)', () => (
    <div className='sans-serif vh-80 bg-navy' style={containerStyle}>
      <FileImportStatus
        t={i18n.getFixedT('en', 'files')}
        doFilesClear={action('clear files')}
        initialExpanded={false}
        filesPending={
          new Array(54).fill(null).map(() => ({
            start: 1601069562246,
            status: 'Pending',
            message: {
              progress: Math.round(Math.random() * 100),
              entries: [{
                path: Math.random().toString(36).slice(2),
                size: Math.round(Math.random() * 1000)
              }]
            }
          }))
        }

        filesFinished={[
          {
            status: 'Done',
            start: 1601069562246,
            end: 1601069572246,
            message: {
              progress: 100,
              entries: [
                novelFile
              ]
            }
          },
          {
            status: 'Done',
            start: 1601069562246,
            end: 1601069572246,
            message: {
              progress: 100,
              entries: [
                ...dirOfFiles
              ]
            }
          }
        ]}
      />
    </div>
  ))
  .add('Import multiple files (expanded, complete)', () => (
    <div className='sans-serif vh-80 bg-navy' style={containerStyle}>
      <FileImportStatus
        t={i18n.getFixedT('en', 'files')}
        doFilesClear={action('clear files')}
        filesFinished={
          new Array(54).fill(null).map(() => ({
            start: 1601069562246,
            status: 'Done',
            message: {
              progress: Math.round(Math.random() * 100),
              entries: [{
                path: Math.random().toString(36).slice(2),
                size: Math.round(Math.random() * 1000)
              }]
            }
          }))
        }
      />
    </div>
  ))

const catFile = {
  path: 'awesome-cat-image-that-is-extermely-awesome.gif',
  size: 2.1e+6
}

const novelFile = {
  path: 'my-nover.docx',
  size: 12200
}

const dirOfFiles = [
  {
    path: 'folder full of files/readme.md',
    size: 0.2e+6
  },
  {
    path: 'folder full of files/chapter-1.md',
    size: 1.1e+6
  },
  {
    path: 'folder full of files/chapter-2.md',
    size: 1.1e+6
  }
]

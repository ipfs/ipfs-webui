import React from 'react'
import { storiesOf } from '@storybook/react'
import i18n from '../../i18n'
import Footer from './Footer.js'

storiesOf('Footer', module)
  .add('default', () => (
    <div className='sans-serif' style={{ padding: 10 }}>
      <Footer codeUrl='https://github.com/ipfs-shipyard/ipld-explorer-components' t={i18n.getFixedT('en', 'status')} />
    </div>
  ))

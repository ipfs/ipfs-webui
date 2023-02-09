import React from 'react'
import { withTranslation } from 'react-i18next'
// Components
import GlyphDots from '../../icons/GlyphDots.js'
import Checkbox from '../checkbox/Checkbox.js'
import FileIcon from '../../files/file-icon/FileIcon.js'
// Styles
import './LoadingAnimation.css'

const FakeHeader = ({ t }) => (
  <header className='gray pv2 flex items-center flex-none'>
    <div className='pa2 w2'><Checkbox disabled /></div>
    <div className='ph2 f6 flex-auto'>{t('app:terms.name')}</div>
    <div className='pl2 pr4 tr f6 flex-none dn db-l'>{t('app:terms.size')}</div>
    <div className='pa2' style={{ width: '2.5rem' }} />
  </header>
)

const FakeFile = ({ nameWidth }) => (
  <div className='b--light-gray relative flex items-center bt' style={{ height: 55 }}>
    <div className='pa2 w2'>
      <Checkbox disabled />
    </div>
    <div className='relative pointer flex items-center flex-grow-1 ph2 pv1 w-40'>
      <div className='dib flex-shrink-0 mr2'>
        <FileIcon cls='fill-charcoal' />
      </div>
      <div className='w-100'>
        <div className={`w-${nameWidth} br1 bg-charcoal-muted f7`}>&nbsp;</div>
        <div className='w-80 br1 mt1 bg-gray f7 o-70'>&nbsp;</div>
      </div>
    </div>
    <div className='size mr4 pl2 pr4 flex-none dn db-l br1 tr f7 bg-gray'>&nbsp;</div>
    <div className='ph2' style={{ width: '2.5rem' }}>
      <GlyphDots className='fill-gray-muted pointer' />
    </div>
  </div>
)

const LoadingAnimation = ({ t }) => (
  <div className='LoadingAnimation'>
    <div className='LoadingAnimationSwipe'>
      <FakeHeader t={t} />
      <FakeFile nameWidth={50} />
      <FakeFile nameWidth={40} />
      <FakeFile nameWidth={60} />
      <FakeFile nameWidth={30} />
      <FakeFile nameWidth={50} />
      <FakeFile nameWidth={60} />
      <FakeFile nameWidth={70} />
      <FakeFile nameWidth={40} />
      <FakeFile nameWidth={30} />
      <FakeFile nameWidth={50} />
    </div>
  </div>
)

export default withTranslation('files')(LoadingAnimation)

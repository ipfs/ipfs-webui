import React from 'react'

export const projectsTour = {
  getSteps: ({ t }) => [{
    content: (
      <div className='montserrat charcoal'>
        <h2 className='f3 fw4'>{t('tour.projects.title')}</h2>
        <p className='tl f6'>{t('tour.projects.paragraph1')}</p>
      </div>
    ),
    placement: 'center',
    target: 'body'
  }],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#69c4cd',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}

export const explorerTour = {
  getSteps: ({ t }) => [
    {
      content: (
        <div className='montserrat charcoal'>
          <h2 className='f3 fw4'>{t('tour.explorer.step1.title')}</h2>
          <p className='tl f6'>{t('tour.explorer.step1.paragraph1')}</p>
        </div>
      ),
      placement: 'center',
      target: 'body'
    },
    {
      content: (
        <div className='montserrat charcoal'>
          <h2 className='f3 fw4'>{t('tour.explorer.step2.title')}</h2>
          <p className='tl f6'>{t('tour.explorer.step2.paragraph1')}</p>
          <p className='tl f6'>{t('tour.explorer.step2.paragraph2')}</p>
        </div>
      ),
      placement: 'bottom',
      target: '.joyride-explorer-crumbs'
    },
    {
      content: (
        <div className='montserrat charcoal'>
          <h2 className='f3 fw4'>{t('tour.explorer.step3.title')}</h2>
          <p className='tl f6'>{t('tour.explorer.step3.paragraph1')}</p>
        </div>
      ),
      placement: 'right',
      target: '.joyride-explorer-node'
    },
    {
      content: (
        <div className='montserrat charcoal'>
          <h2 className='f3 fw4'>{t('tour.explorer.step4.title')}</h2>
          <p className='tl f6'>{t('tour.explorer.step4.paragraph1')}</p>
        </div>
      ),
      placement: 'left',
      target: '.joyride-explorer-cid'
    },
    {
      content: (
        <div className='montserrat charcoal'>
          <h2 className='f3 fw4'>{t('tour.explorer.step5.title')}</h2>
          <p className='tl f6'>{t('tour.explorer.step5.paragraph1')}</p>
        </div>
      ),
      locale: { last: 'Finish' },
      placement: 'left',
      target: '.joyride-explorer-graph'
    }
  ],
  styles: {
    options: {
      width: '500px',
      primaryColor: '#69c4cd',
      textColor: '#34373f',
      zIndex: 999
    }
  }
}
